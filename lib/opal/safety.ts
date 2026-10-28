export type OpalSafetyIntent = "safe" | "clinical" | "urgent";

const urgentPatterns = [
  /emergency/i,
  /urgent/i,
  /can't breathe|cannot breathe|difficulty breathing/i,
  /heavy bleeding|bleeding heavily/i,
  /unconscious|not waking/i,
  /severe pain/i,
  /self[- ]?harm|suicid/i,
  /አስቸኳይ/,
  /መተንፈስ አልቻልኩም/,
  /ከባድ ደም መፍሰስ/,
];

const clinicalPatterns = [
  /diagnos/i,
  /disease do i have/i,
  /what is wrong with me/i,
  /cure|treat|treatment/i,
  /medicine|medication|tablet|dose|dosage|prescri/i,
  /should i stop taking/i,
  /symptom/i,
  /pain|fever|vomit|vomiting|diarrhea/i,
  /blood sugar|blood pressure/i,
  /ምርመራ/,
  /በሽታ/,
  /መድሃኒት|መድኃኒት/,
  /ህመም/,
  /ትኩሳት/,
];

export function classifyOpalQuestion(question: string): OpalSafetyIntent {
  const normalized = question.trim();
  if (urgentPatterns.some((pattern) => pattern.test(normalized))) {
    return "urgent";
  }
  if (clinicalPatterns.some((pattern) => pattern.test(normalized))) {
    return "clinical";
  }
  return "safe";
}

export function getOpalSafetyResponse(
  intent: Exclude<OpalSafetyIntent, "safe">,
  language: "am" | "en",
): string {
  if (intent === "urgent") {
    return language === "am"
      ? "ይህ ጥያቄ አስቸኳይ ሊሆን የሚችል ምልክትን ይጠቁማል። ኦፓል አስቸኳይ ሁኔታን ሊገመግም አይችልም። እባክዎ በአካባቢዎ ያለውን የአስቸኳይ አገልግሎት ወይም ብቁ የጤና ባለሙያን ወዲያውኑ ያነጋግሩ።"
      : "This question may describe an urgent concern. Opal cannot assess emergencies. Please contact your local emergency service or a qualified health professional now.";
  }
  return language === "am"
    ? "ኦፓል ምርመራ፣ የመድሃኒት ምክር ወይም የግል ሕክምና ሕክምና ሊሰጥ አይችልም። ከብቁ የጤና ባለሙያ ጋር ይነጋገሩ። ኦፓል ከተዘጋጁ አጠቃላይ የጤና ትምህርቶች ጋር ብቻ ሊረዳ ይችላል።"
    : "Opal cannot diagnose, recommend medicine, or provide individual treatment. Please speak with a qualified health professional. Opal can only help with prepared general learning topics.";
}
