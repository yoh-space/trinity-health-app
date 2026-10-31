import type { OpalLanguage, OpalSource } from "./opalContext";
import { buildOpalSystemInstruction, buildOpalUserPrompt } from "./opalPrompt";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type StructuredAnswer = {
  answer?: unknown;
  sourceIds?: unknown;
};

export async function generateOpalAnswer(
  apiKey: string,
  question: string,
  language: OpalLanguage,
  sources: OpalSource[],
): Promise<{ answer: string; sourceIds: string[] }> {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  let response: Response;

  try {
    response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildOpalSystemInstruction(language) }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildOpalUserPrompt(question, sources) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 650,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              answer: { type: "STRING" },
              sourceIds: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["answer", "sourceIds"],
          },
        },
      }),
    });
  } catch {
    throw new Error("OPAL_PROVIDER_UNAVAILABLE");
  }

  if (response.status === 429) throw new Error("OPAL_RATE_LIMIT");
  if (response.status === 401 || response.status === 403) {
    throw new Error("OPAL_INVALID_API_KEY");
  }
  if (!response.ok) throw new Error(`OPAL_PROVIDER_ERROR_${response.status}`);

  const payload = (await response.json()) as GeminiResponse;
  const outputText = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!outputText) throw new Error("OPAL_EMPTY_RESPONSE");

  let structured: StructuredAnswer;
  try {
    structured = JSON.parse(outputText) as StructuredAnswer;
  } catch {
    return { answer: outputText, sourceIds: [] };
  }

  const answer = typeof structured.answer === "string" ? structured.answer.trim() : "";
  if (!answer) throw new Error("OPAL_EMPTY_RESPONSE");

  const allowedSourceIds = new Set(sources.map((source) => source.id));
  const sourceIds = Array.isArray(structured.sourceIds)
    ? structured.sourceIds.filter(
        (id): id is string => typeof id === "string" && allowedSourceIds.has(id),
      )
    : [];

  return { answer, sourceIds };
}
