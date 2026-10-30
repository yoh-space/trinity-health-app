export type OpalSafetyIntent = "safe" | "clinical" | "urgent";

export type OpalLanguage = "am" | "en";

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

const likelyPersonalDetailPatterns = [
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
  /\+?\d[\d\s().-]{7,}\d/,
  /\b(?:my name is|call me|i am called)\s+[\p{L}'-]+(?:\s+[\p{L}'-]+){0,2}/iu,
  /\b(?:my age is|i am|i'm)\s+\d{1,3}\s*(?:years? old)?\b/i,
  /\b(?:my (?:weight|height|bmi|blood pressure)|i weigh)\s*(?:is|about|of)?\s*\d/i,
  /\b(?:my (?:address|email|phone|telephone|date of birth|dob)|i live at)\b/i,
  /\b(?:i am|i'm|i have|i've|my|our)\b[\s\S]{0,100}\b(?:pregnan\w*|breastfeed\w*|diabet\w*|asthma|epilep\w*|cancer|hiv|tuberculosis|anemia|anaemia|depression|anxiety|allerg\w*|infection|disorder|disease|condition|diagnos\w*)\b/i,
  /\bmy\s+(?:child|baby|son|daughter|kid|mother|father|wife|husband|partner)\b/i,
  /\b(?:my|our)\s+\d{1,2}\s*[- ]?(?:year|month|week)[- ]?old\b/i,
  /\b(?:i was diagnosed with|my diagnosis is|i suffer from)\s+\w+/i,
  /(?:ስሜ|ዕድሜዬ|እድሜዬ|ክብደቴ|ቁመቴ|ልጄ|ህፃኔ|ሕፃኔ|አድራሻዬ|ስልኬ|ኢሜይሌ)/,
  /የእኔ.*(?:ስም|ዕድሜ|እድሜ|ቁመት|ክብደት|አድራሻ|ስልክ)/,
  /(?:እርጉዝ ነኝ|ጡት እያጠባሁ ነኝ)/,
];

export function containsLikelyPersonalDetails(question: string): boolean {
  return likelyPersonalDetailPatterns.some((pattern) => pattern.test(question));
}

export function getOpalPrivacyResponse(language: OpalLanguage): string {
  return language === "am"
    ? "ይህን መልዕክት ለግላዊነትዎ ወደ Gemini አልላክነውም። እባክዎ ስም፣ ዕድሜ፣ የመገናኛ ወይም የግል የጤና ዝርዝሮችን አስወግደው እንደ አጠቃላይ ጥያቄ ይጻፉ።"
    : "I didn’t send this message to Gemini to protect your privacy. Remove names, ages, contact details, and personal health information, then ask it as a general question.";
}

export function getOpalSafetyResponse(
  intent: Exclude<OpalSafetyIntent, "safe">,
  language: OpalLanguage,
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
