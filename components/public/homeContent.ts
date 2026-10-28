export type PublicLanguage = "am" | "en";

export const homeCopy = {
  am: {
    eyebrow: "ለዕለት ተዕለት እንክብካቤ",
    welcome: "ሰላም፣ እንኳን ደህና መጡ።",
    subtitle: "ትንሽ እውቀት፣ ብዙ እንክብካቤ።",
    todaysLesson: "የዛሬ ትንሽ ትምህርት",
    lessonNumber: "01 / 05",
    foodSafety: "የምግብ ደህንነት",
    lessonTitle: "ጤናማ ምግብ፣ ከትንሽ ልምዶች ይጀምራል።",
    lessonSummary: "ንጹህ እጅ፣ በደንብ የበሰለ ምግብ፣ የተከደነ ዕቃ። አንድ ላይ እንማር።",
    learnTogether: "አብረን እንማር",
    minutes: "3 ደቂቃ",
    recipeAction: "ምን እናብስል?",
    recipeSub: "ቀላል የምግብ ሀሳቦች",
    notesAction: "የእኔ ማስታወሻዎች",
    notesSub: "ለሌላ ጊዜ ያስቀምጡ",
    growTitle: "አንድ ላይ እናድግ",
    seeAll: "ሁሉንም እይ",
    pregnancy: "የእርግዝና አመጋገብ",
    pregnancyTitle: "በእርግዝና ጊዜ የተለያዩ የቤት ውስጥ ምግቦችን መመገብ",
    childNutrition: "የህፃናት አመጋገብ",
    childNutritionTitle: "ለታዳጊ ህፃናት ለስላሳ እና የተሟላ ተጨማሪ ምግብ",
    readTime: (minutes: number) => `${minutes} ደቂቃ ንባብ`,
    askOpal: "ጥያቄ አለዎት? ኦፓልን ይጠይቁ።",
    askOpalSub: "ከአካባቢ ማስታወሻዎች አብረን እንማር።",
    footer: "በእንክብካቤ የተሰራ፣ ለቤተሰብ።",
    settingsTitle: "ቋንቋ",
    english: "English",
    amharic: "አማርኛ",
    cancel: "ዝጋ",
  },
  en: {
    eyebrow: "YOUR EVERYDAY FIELD NOTES",
    welcome: "Selam, make yourself at home.",
    subtitle: "A little learning. A lot of care.",
    todaysLesson: "TODAY’S LITTLE LESSON",
    lessonNumber: "01 / 05",
    foodSafety: "Food safety",
    lessonTitle: "Small habits. Safer family meals.",
    lessonSummary: "Clean hands, a well-cooked pot, a covered dish. Let’s start with the everyday things.",
    learnTogether: "Open today’s note",
    minutes: "3 min",
    recipeAction: "What’s in your kitchen?",
    recipeSub: "Find a little meal inspiration",
    notesAction: "Your saved notes",
    notesSub: "Keep a good thought close",
    growTitle: "Grow a little every day",
    seeAll: "View all",
    pregnancy: "PREGNANCY NUTRITION",
    pregnancyTitle: "Building a Varied Plate During Pregnancy",
    childNutrition: "CHILD FEEDING",
    childNutritionTitle: "Soft, Mashed Meals for Growing Young Children",
    readTime: (minutes: number) => `${minutes} min read`,
    askOpal: "A little curious? Ask Opal.",
    askOpalSub: "Explore answers from our bundled notes.",
    footer: "Rooted in care. Made for family.",
    settingsTitle: "Choose a language",
    english: "English",
    amharic: "አማርኛ",
    cancel: "Cancel",
  },
} satisfies Record<PublicLanguage, {
  eyebrow: string; welcome: string; subtitle: string; todaysLesson: string;
  lessonNumber: string; foodSafety: string; lessonTitle: string; lessonSummary: string;
  learnTogether: string; minutes: string; recipeAction: string; recipeSub: string;
  notesAction: string; notesSub: string; growTitle: string; seeAll: string;
  pregnancy: string; pregnancyTitle: string; childNutrition: string; childNutritionTitle: string;
  readTime: (minutes: number) => string; askOpal: string; askOpalSub: string; footer: string;
  settingsTitle: string; english: string; amharic: string; cancel: string;
}>;
