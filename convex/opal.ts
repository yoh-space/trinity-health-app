import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  classifyOpalQuestion,
  containsLikelyPersonalDetails,
  getOpalPrivacyResponse,
  getOpalSafetyResponse,
} from "../lib/opal/safety";
import { generateOpalAnswer } from "./ai/gemini";
import { selectRelevantOpalSources } from "./ai/opalContext";

const languageValidator = v.union(v.literal("am"), v.literal("en"));
const sourceValidator = v.object({
  id: v.string(),
  title: v.string(),
  titleAm: v.string(),
});

export const ask = action({
  args: {
    consented: v.literal(true),
    language: languageValidator,
    question: v.string(),
  },
  returns: v.object({
    answer: v.string(),
    safety: v.boolean(),
    sources: v.array(sourceValidator),
  }),
  handler: async (ctx, { consented, language, question }) => {
    if (!consented) throw new Error("OPAL_CONSENT_REQUIRED");

    const cleanQuestion = question.trim();
    if (!cleanQuestion) throw new Error("OPAL_EMPTY_QUESTION");
    if (cleanQuestion.length > 1000) throw new Error("OPAL_QUESTION_TOO_LONG");

    if (containsLikelyPersonalDetails(cleanQuestion)) {
      return {
        answer: getOpalPrivacyResponse(language),
        safety: true,
        sources: [],
      };
    }

    const safetyIntent = classifyOpalQuestion(cleanQuestion);
    if (safetyIntent !== "safe") {
      return {
        answer: getOpalSafetyResponse(safetyIntent, language),
        safety: true,
        sources: [],
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("OPAL_NOT_CONFIGURED");

    const lessons = await ctx.runQuery(internal.education.listPublishedForOpal, {});
    const relevantSources = selectRelevantOpalSources(
      lessons,
      cleanQuestion,
      language,
    );
    const result = await generateOpalAnswer(
      apiKey,
      cleanQuestion,
      language,
      relevantSources,
    );

    const allowedSources = new Map(relevantSources.map((source) => [source.id, source]));
    const sources = result.sourceIds
      .map((id) => allowedSources.get(id))
      .filter((source): source is NonNullable<typeof source> => Boolean(source))
      .map(({ id, title, titleAm }) => ({ id, title, titleAm }));

    return { answer: result.answer, safety: false, sources };
  },
});
