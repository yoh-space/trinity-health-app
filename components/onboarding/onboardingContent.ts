import type { WelcomeLanguage } from "../welcome/welcomeCopy";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type LocalizedOption = {
  id: string;
  en: string;
  am: string;
  detailEn?: string;
  detailAm?: string;
};

export const onboardingCopy: Record<
  WelcomeLanguage,
  {
    brandTagline: string;
    profileEyebrow: string;
    title: Record<OnboardingStep, string>;
    subtitle: Record<OnboardingStep, string>;
    forPrompt: string;
    age: string;
    focusPrompt: string;
    focusHint: string;
    otherSupport: string;
    otherSupportHint: string;
    otherSupportPlaceholder: string;
    meals: string;
    activity: string;
    eatingPattern: string;
    goals: string;
    goalsHint: string;
    otherGoal: string;
    otherGoalHint: string;
    otherGoalPlaceholder: string;
    consultation: string;
    otherConsultation: string;
    otherConsultationHint: string;
    otherConsultationPlaceholder: string;
    optionalPrivacy: string;
    skip: string;
    continue: string;
    showAll: string;
    summary: string;
    notSpecified: string;
    remember: string;
    sessionOnly: string;
    localPrivacy: string;
    startPlan: string;
    canChange: string;
    values: Record<string, string>;
  }
> = {
  am: {
    brandTagline: "ትንሽ እውቀት፣ ብዙ እንክብካቤ",
    profileEyebrow: "የእርስዎ የጤና መገለጫ",
    title: {
      1: "ይህ ለማን ነው?",
      2: "ምን ላይ ድጋፍ ይፈልጋሉ?",
      3: "የዕለት ተዕለት ልምድዎ",
      4: "ግቦችዎ ምንድን ናቸው?",
      5: "ዕቅድዎ ዝግጁ ነው",
    },
    subtitle: {
      1: "ትምህርቶችንና ምክክርን ለእርስዎ እንዲስማሙ ለማድረግ።",
      2: "የሚመለከቱትን ሁሉ ይምረጡ። ሰፊ ርዕሶች ብቻ፤ ምርመራ፣ መድኃኒት ወይም ውጤት አያስፈልግም።",
      3: "መመሪያው ከእውነተኛ የኑሮ እና የአመጋገብ ልምድዎ ጋር እንዲስማማ።",
      4: "እስከ ሶስት ይምረጡ።",
      5: "ከመጀመራችን በፊት በአጭሩ ይመልከቱ።",
    },
    forPrompt: "ይህ ለማን ነው?",
    age: "የዕድሜ ክልል",
    focusPrompt: "ምን ላይ ድጋፍ ይፈልጋሉ?",
    focusHint: "አጠቃላይ ርዕሶችን ብቻ ይምረጡ።",
    otherSupport: "ሌላ የሚፈልጉት ድጋፍ (አማራጭ)",
    otherSupportHint: "አጠቃላይ ርዕስ ብቻ ይጻፉ። ስም፣ ምርመራ፣ መድኃኒት ወይም ውጤት አያካትቱ።",
    otherSupportPlaceholder: "ለምሳሌ፦ ለቤተሰብ ጤናማ ምግብ ማዘጋጀት",
    meals: "በቀን የሚመገቡት ምግብ",
    activity: "እንቅስቃሴ",
    eatingPattern: "የአመጋገብ ልምድ (አማራጭ)",
    goals: "ግቦችዎ ምንድን ናቸው?",
    goalsHint: "እስከ ሶስት ይምረጡ።",
    otherGoal: "ሌላ ግብ (አማራጭ)",
    otherGoalHint: "አጠቃላይ ግብ ብቻ ይጻፉ።",
    otherGoalPlaceholder: "ለምሳሌ፦ ስለ ቤተሰብ ምግብ ተጨማሪ መማር",
    consultation: "የምክክር ዓይነት",
    otherConsultation: "ሌላ የምክክር ምርጫ (አማራጭ)",
    otherConsultationHint: "አጠቃላይ ምርጫ ብቻ ይጻፉ።",
    otherConsultationPlaceholder: "ለምሳሌ፦ ከቤተሰብ አባል ጋር መሳተፍ",
    optionalPrivacy: "ሁሉም ጥያቄዎች አማራጭ ናቸው። ስም፣ ስልክ ወይም መለያ አይጠየቅም።",
    skip: "ይህን ዝለል",
    continue: "ቀጥል",
    showAll: "ማዋቀሩን ዝለል፣ ሁሉንም አሳይ",
    summary: "የጤና መገለጫዎ",
    notSpecified: "አልተገለጸም",
    remember: "በዚህ መሣሪያ ላይ ያስቀምጡ",
    sessionOnly: "ካልሆነ መልሶችዎ ለዚህ ክፍለ ጊዜ ብቻ ይቆያሉ።",
    localPrivacy:
      "መልሶችዎ በዚህ መሣሪያ ላይ ብቻ ይቆያሉ፤ ምንም አይላክም። ይህ ትምህርት ነው፣ የሕክምና ምክር አይደለም።",
    startPlan: "ዕቅዴን ጀምር",
    canChange: "ከመጀመርዎ በፊት መልስዎን ለመቀየር ወደ ኋላ ይመለሱ።",
    values: {
      myself: "ለራሴ",
      child: "ለልጄ",
      family: "ለቤተሰቤ",
      caregiver: "ለምከባከበው ሰው",
      under5: "ከ5 በታች",
      age5to17: "5–17",
      age18to39: "18–39",
      age40to59: "40–59",
      age60plus: "60+",
      diabetes: "ስኳር በሽታ",
      diabetesDetail: "ወይም ከፍተኛ የደም ስኳር",
      bloodPressure: "የደም ግፊት",
      heartHealth: "የልብ ጤና",
      weight: "የክብደት አያያዝ",
      pregnancy: "እርግዝና",
      breastfeeding: "ጡት ማጥባት",
      childNutrition: "የልጆች አመጋገብ",
      wellbeing: "ጭንቀትና ደህንነት",
      general: "መግለጽ አልፈልግም / አጠቃላይ ጤና",
      meals12: "1–2",
      meals3: "3",
      meals4: "4 ወይም ከዚያ በላይ",
      seated: "ብዙ ጊዜ ተቀምጬ",
      seatedDetail: "በቀን ትንሽ እንቅስቃሴ",
      moderate: "መካከለኛ እንቅስቃሴ",
      moderateDetail: "መደበኛ መራመድ ወይም የቤት ሥራ",
      active: "በጣም ንቁ",
      activeDetail: "አካላዊ ሥራ ወይም ስፖርት",
      fasting: "የጾም ቀናት",
      plantBased: "በአብዛኛው ከዕፅዋት የተዘጋጀ",
      allergies: "የምግብ አለርጂ",
      budget: "በበጀት የተመጣጠነ",
      healthyEating: "ጤናማ አመጋገብን መማር",
      longTerm: "ለረጅም ጊዜ የጤና ችግር ድጋፍ",
      nutritionTherapy: "የአመጋገብ ቴራፒ",
      professional: "ከባለሙያ ጋር መነጋገር",
      familyMeals: "የቤተሰብ ምግብ ማቀድ",
      online: "በመስመር ላይ",
      inPerson: "በአካል",
      either: "ሁለቱም ይስማማሉ",
    },
  },
  en: {
    brandTagline: "A little learning. A lot of care.",
    profileEyebrow: "YOUR HEALTH PROFILE",
    title: {
      1: "Who is this for?",
      2: "What would you like support with?",
      3: "Your daily routine",
      4: "What are your goals?",
      5: "Your plan is ready",
    },
    subtitle: {
      1: "So we can fit lessons and consultations to the right person.",
      2: "Choose any that apply. Broad topics only. No diagnoses, medication, or test results needed.",
      3: "So guidance fits the way you actually live and eat.",
      4: "Pick up to three.",
      5: "Take a quick look before we begin.",
    },
    forPrompt: "Who is this for?",
    age: "Age range",
    focusPrompt: "What would you like support with?",
    focusHint: "Choose any that apply. Broad topics only.",
    otherSupport: "Other support topic (optional)",
    otherSupportHint:
      "Share a general topic only. Do not include names, diagnoses, medicines, or test results.",
    otherSupportPlaceholder: "For example: planning healthier family meals",
    meals: "Meals per day",
    activity: "Physical activity",
    eatingPattern: "Eating pattern (optional)",
    goals: "What are your goals?",
    goalsHint: "Pick up to three.",
    otherGoal: "Other goal (optional)",
    otherGoalHint:
      "Share a general goal only. Do not include names, diagnoses, medicines, or test results.",
    otherGoalPlaceholder: "For example: learn more family meal ideas",
    consultation: "Preferred consultation format",
    otherConsultation: "Other consultation preference (optional)",
    otherConsultationHint:
      "Share a general preference only. Do not include names, phone numbers, or personal details.",
    otherConsultationPlaceholder: "For example: attend with a family member",
    optionalPrivacy:
      "Every question is optional. No name, phone number, or account.",
    skip: "Skip this step",
    continue: "Continue",
    showAll: "Skip setup. Show me everything.",
    summary: "Your health profile",
    notSpecified: "Not specified",
    remember: "Remember on this device",
    sessionOnly: "Otherwise your answers last for this session only.",
    localPrivacy:
      "Answers stay only on this device; nothing is sent. This is education, not medical advice.",
    startPlan: "Start my plan",
    canChange: "Go back to change any answer before you begin.",
    values: {
      myself: "Myself",
      child: "My child",
      family: "My whole family",
      caregiver: "Someone I care for",
      under5: "Under 5",
      age5to17: "5–17",
      age18to39: "18–39",
      age40to59: "40–59",
      age60plus: "60+",
      diabetes: "Diabetes",
      diabetesDetail: "or high blood sugar",
      bloodPressure: "High blood pressure",
      heartHealth: "Heart health",
      weight: "Weight management",
      pregnancy: "Pregnancy",
      breastfeeding: "Breastfeeding",
      childNutrition: "Child nutrition",
      wellbeing: "Stress & wellbeing",
      general: "General wellness / prefer not to say",
      meals12: "1–2",
      meals3: "3",
      meals4: "4 or more",
      seated: "Mostly seated",
      seatedDetail: "Little daily movement",
      moderate: "Moderately active",
      moderateDetail: "Regular walking or chores",
      active: "Very active",
      activeDetail: "Physical work or exercise",
      fasting: "Fasting days",
      plantBased: "Mostly plant-based",
      allergies: "Food allergies",
      budget: "Budget-minded",
      healthyEating: "Learn healthy eating",
      longTerm: "Support for a long-term condition",
      nutritionTherapy: "Nutrition therapy",
      professional: "Talk to a professional",
      familyMeals: "Plan family meals",
      online: "Online",
      inPerson: "In person",
      either: "Either works",
    },
  },
};

export const profileOptions: LocalizedOption[] = [
  { id: "myself", en: "Myself", am: "ለራሴ" },
  { id: "child", en: "My child", am: "ለልጄ" },
  { id: "family", en: "My whole family", am: "ለቤተሰቤ" },
  { id: "caregiver", en: "Someone I care for", am: "ለምከባከበው ሰው" },
];

export const ageOptions: LocalizedOption[] = [
  { id: "under5", en: "Under 5", am: "ከ5 በታች" },
  { id: "age5to17", en: "5–17", am: "5–17" },
  { id: "age18to39", en: "18–39", am: "18–39" },
  { id: "age40to59", en: "40–59", am: "40–59" },
  { id: "age60plus", en: "60+", am: "60+" },
];

export const supportOptions: LocalizedOption[] = [
  {
    id: "diabetes",
    en: "Diabetes",
    am: "ስኳር በሽታ",
    detailEn: "or high blood sugar",
    detailAm: "ወይም ከፍተኛ የደም ስኳር",
  },
  { id: "bloodPressure", en: "High blood pressure", am: "የደም ግፊት" },
  { id: "heartHealth", en: "Heart health", am: "የልብ ጤና" },
  { id: "weight", en: "Weight management", am: "የክብደት አያያዝ" },
  { id: "pregnancy", en: "Pregnancy", am: "እርግዝና" },
  { id: "breastfeeding", en: "Breastfeeding", am: "ጡት ማጥባት" },
  { id: "childNutrition", en: "Child nutrition", am: "የልጆች አመጋገብ" },
  { id: "wellbeing", en: "Stress & wellbeing", am: "ጭንቀትና ደህንነት" },
];

export const mealOptions: LocalizedOption[] = [
  { id: "meals12", en: "1–2", am: "1–2" },
  { id: "meals3", en: "3", am: "3" },
  { id: "meals4", en: "4 or more", am: "4 ወይም ከዚያ በላይ" },
];

export const activityOptions: LocalizedOption[] = [
  {
    id: "seated",
    en: "Mostly seated",
    am: "ብዙ ጊዜ ተቀምጬ",
    detailEn: "Little daily movement",
    detailAm: "በቀን ትንሽ እንቅስቃሴ",
  },
  {
    id: "moderate",
    en: "Moderately active",
    am: "መካከለኛ እንቅስቃሴ",
    detailEn: "Regular walking or chores",
    detailAm: "መደበኛ መራመድ ወይም የቤት ሥራ",
  },
  {
    id: "active",
    en: "Very active",
    am: "በጣም ንቁ",
    detailEn: "Physical work or exercise",
    detailAm: "አካላዊ ሥራ ወይም ስፖርት",
  },
];

export const eatingOptions: LocalizedOption[] = [
  { id: "fasting", en: "Fasting days", am: "የጾም ቀናት" },
  { id: "plantBased", en: "Mostly plant-based", am: "በአብዛኛው ከዕፅዋት የተዘጋጀ" },
  { id: "allergies", en: "Food allergies", am: "የምግብ አለርጂ" },
  { id: "budget", en: "Budget-minded", am: "በበጀት የተመጣጠነ" },
];

export const goalOptions: LocalizedOption[] = [
  { id: "healthyEating", en: "Learn healthy eating", am: "ጤናማ አመጋገብን መማር" },
  {
    id: "longTerm",
    en: "Support for a long-term condition",
    am: "ለረጅም ጊዜ የጤና ችግር ድጋፍ",
  },
  { id: "nutritionTherapy", en: "Nutrition therapy", am: "የአመጋገብ ቴራፒ" },
  { id: "professional", en: "Talk to a professional", am: "ከባለሙያ ጋር መነጋገር" },
  { id: "familyMeals", en: "Plan family meals", am: "የቤተሰብ ምግብ ማቀድ" },
];

export const consultationOptions: LocalizedOption[] = [
  { id: "online", en: "Online", am: "በመስመር ላይ" },
  { id: "inPerson", en: "In person", am: "በአካል" },
  { id: "either", en: "Either works", am: "ሁለቱም ይስማማሉ" },
];
