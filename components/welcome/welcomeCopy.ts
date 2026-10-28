export type WelcomeLanguage = "am" | "en";

export const welcomeCopy = {
  am: {
    eyebrow: "እንኳን ወደ ትሪኒቲ ሄልዝ ሶሉሽን መጡ",
    headlineFirst: "ለእያንዳንዱ ቤተሰብ",
    headlineSecond: "የተሻለ ጤና!",
    introduction:
      "ጤናዎ፣ ተልዕኳችን። ግላዊ የአመጋገብ ቴራፒ፣ ታማኝ የጤና ትምህርት እና ሙያዊ ምክክር በአካል ወይም በበይነመረብ፣ ባሉበት ሆነው ያግኙ።",
    sdg:
      "አብረን የዘላቂ ልማት ግብ 3 (ጥሩ ጤናና ደህንነት) እናሳካለን፤ ጤናማ ሕይወት ለሁሉም ተደራሽ እንዲሆን።",
    closing: "ወደ የተሻለ ጤና የሚደረገው ጉዞዎ እዚህ ይጀምራል!",
    languagePrompt: "ቋንቋዎን ይምረጡ",
    begin: "አብረን እንጀምር",
    explore: "በቀጥታ ወደ ትምህርቶች",
    privacyNote: "ነፃ መማር። መመዝገብ አያስፈልግም።",
    categories: ["ትምህርት", "ምክክር", "ቴራፒ"],
  },
  en: {
    eyebrow: "WELCOME TO TRINITY HEALTH SOLUTION",
    headlineFirst: "Better health",
    headlineSecond: "for every family!",
    introduction:
      "Your health, our mission. Access personalized nutrition therapy, trusted health education, and professional consultations, in person or online, wherever you are.",
    sdg:
      "Together, we are advancing SDG 3: Good Health and Well-Being, making healthier lives accessible to everyone.",
    closing: "Your journey to better health starts here!",
    languagePrompt: "Make yourself at home in",
    begin: "Let’s begin together",
    explore: "Just here to explore? Skip the setup",
    privacyNote: "Free to learn. No account. No personal details.",
    categories: ["Education", "Consultation", "Therapy"],
  },
} satisfies Record<
  WelcomeLanguage,
  {
    eyebrow: string;
    headlineFirst: string;
    headlineSecond: string;
    introduction: string;
    sdg: string;
    closing: string;
    languagePrompt: string;
    begin: string;
    explore: string;
    privacyNote: string;
    categories: [string, string, string];
  }
>;

export const storyCopy = {
  eyebrow: "WELLNESS WITHOUT BORDERS",
  headlineFirst: "Better health for",
  headlineSecond: "every family!",
  description:
    "Your health, our mission. Personalized nutrition therapy, trusted health education, and professional consultations, in person or online, wherever you are.",
  commitments: [
    "Made for Ethiopian families",
    "Open to everyone. No account needed.",
    "Advancing SDG 3: Good Health and Well-Being",
  ],
  portal: "Open the staff portal (demo)",
  amharicNote: "እንክብካቤ ከቤት ይጀምራል።",
  englishNote: "Care begins at home.",
};
