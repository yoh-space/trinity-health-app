import type { Doc } from "../_generated/dataModel";

export type OpalLanguage = "am" | "en";

export type OpalSource = {
  id: string;
  title: string;
  titleAm: string;
  context: string;
};

const stopWords = new Set([
  "about", "after", "and", "are", "can", "could", "does", "for", "from",
  "give", "have", "help", "how", "into", "just", "me", "more", "need",
  "please", "should", "show", "some", "tell", "that", "the", "this", "what",
  "when", "where", "which", "with", "would", "you", "your", "እንዴት", "ምን",
  "እችላለሁ", "እችላለን", "አለ", "ነው", "ነኝ", "ለእኔ", "እባክዎ",
]);

function terms(value: string): string[] {
  return (value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (term) => term.length > 2 && !stopWords.has(term),
  );
}

function overlapScore(queryTerms: Set<string>, value: string): number {
  const valueTerms = new Set(terms(value));
  let matches = 0;
  for (const term of queryTerms) {
    if (valueTerms.has(term)) matches += 1;
  }
  return matches;
}

function makeLessonContext(
  lesson: Doc<"educationContent">,
  questionTerms: Set<string>,
  language: OpalLanguage,
): string {
  const title = language === "am" ? lesson.titleAm : lesson.title;
  const summary = language === "am" ? lesson.summaryAm : lesson.summary;
  const selectedSections = (lesson.sections ?? [])
    .map((section) => ({
      title: language === "am" ? section.titleAm : section.title,
      body: language === "am" ? section.bodyAm : section.body,
    }))
    .map((section) => ({
      ...section,
      score:
        overlapScore(questionTerms, section.title) * 2 +
        overlapScore(questionTerms, section.body),
    }))
    .filter((section) => section.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((section) => `${section.title}\n${section.body.slice(0, 1100)}`);

  const fallbackBody = language === "am" ? lesson.contentAm : lesson.content;
  const body = selectedSections.length
    ? selectedSections.join("\n\n")
    : fallbackBody.slice(0, 1100);

  return `Title: ${title}\nSummary: ${summary.slice(0, 500)}\nLesson text:\n${body}`;
}

export function selectRelevantOpalSources(
  lessons: Doc<"educationContent">[],
  question: string,
  language: OpalLanguage,
): OpalSource[] {
  const queryTerms = new Set(terms(question));
  if (!queryTerms.size) return [];

  return lessons
    .map((lesson) => {
      const title = `${lesson.title} ${lesson.titleAm}`;
      const summary = `${lesson.summary} ${lesson.summaryAm}`;
      const sectionText = (lesson.sections ?? [])
        .map((section) => `${section.title} ${section.titleAm} ${section.body} ${section.bodyAm}`)
        .join(" ");
      const lessonText = `${lesson.content} ${lesson.contentAm} ${sectionText}`;
      const score =
        overlapScore(queryTerms, title) * 4 +
        overlapScore(queryTerms, summary) * 2 +
        overlapScore(queryTerms, lesson.category) +
        overlapScore(queryTerms, lessonText);

      return { lesson, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ lesson }) => ({
      id: lesson._id,
      title: lesson.title,
      titleAm: lesson.titleAm,
      context: makeLessonContext(lesson, queryTerms, language),
    }));
}
