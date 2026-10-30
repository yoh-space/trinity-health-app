import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { usePathname, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../convex/_generated/api";
import { AUTHENTICATED_CARE_TAB } from "../constants/authRoutes";
import { useTrinityStore } from "../store/useTrinityStore";

type RequestType = "clinical" | "counselling";
type ContactMethod = "email" | "phone";

const copy = {
  en: {
    eyebrow: "TRINITY CARE",
    title: "Request care support",
    subtitle: "Choose the kind of support and tell us how to contact you.",
    loading: "Checking your account…",
    signInTitle: "Sign in to request care",
    signInBody: "To protect your request and save it to your account, sign in or create an account first.",
    signInAction: "Sign in or create an account",
    requestType: "What kind of support are you looking for?",
    clinical: "Clinical health support",
    clinicalHint: "A health concern or nutrition-related support",
    counselling: "Counselling support",
    counsellingHint: "Emotional wellbeing or someone to talk to",
    contactMethod: "How should we contact you?",
    email: "Email",
    phone: "Phone",
    contactEmail: "Email address",
    contactPhone: "Phone number",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+251 ...",
    summary: "Briefly, what support are you seeking? (optional)",
    summaryPlaceholder: "Keep this general. Do not include diagnoses, medicines, or urgent details.",
    consent: "I agree to send and store my contact details and request with Trinity for possible follow-up.",
    submit: "Submit care request",
    submitting: "Submitting…",
    invalidContact: "Enter a valid email address or phone number.",
    consentRequired: "Please agree to share this information before submitting.",
    failedTitle: "Could not submit request",
    failedBody: "Check your connection and try again. Your request has not been confirmed.",
    safetyTitle: "Not for emergencies",
    safetyBody: "This form is not continuously monitored and cannot provide urgent care. If you may be in immediate danger or need urgent help, contact local emergency services or go to a health facility.",
    serviceNoticeTitle: "Please note",
    serviceNoticeBody: "Submitting saves a request to your account. It does not book or confirm an appointment, and a response time or follow-up is not guaranteed. The staff review and scheduling workflow is not yet connected in this app.",
    successTitle: "Request saved",
    successBody: "Your request has been recorded in your account. No appointment has been booked.",
    reference: "Reference",
    newRequest: "Send another request",
    myRequests: "Your recent requests",
    submitted: "Submitted",
    inReview: "In review",
    contacted: "Contacted",
    closed: "Closed",
    noRequests: "No requests submitted yet.",
    askOpal: "Need general learning instead?",
    openLearning: "Browse learning",
    date: "Created",
  },
  am: {
    eyebrow: "ትሪኒቲ እንክብካቤ",
    title: "የእንክብካቤ ድጋፍ ይጠይቁ",
    subtitle: "የሚፈልጉትን ድጋፍ ይምረጡና እንዴት እንደምንገናኝዎ ይንገሩን።",
    loading: "መለያዎን በማረጋገጥ ላይ…",
    signInTitle: "የእንክብካቤ ጥያቄ ለመላክ ይግቡ",
    signInBody: "ጥያቄዎን ለመጠበቅና በመለያዎ ለማስቀመጥ መጀመሪያ ይግቡ ወይም መለያ ይፍጠሩ።",
    signInAction: "ይግቡ ወይም መለያ ይፍጠሩ",
    requestType: "ምን ዓይነት ድጋፍ ይፈልጋሉ?",
    clinical: "የጤና ባለሙያ ድጋፍ",
    clinicalHint: "የጤና ጉዳይ ወይም ከአመጋገብ ጋር የተያያዘ ድጋፍ",
    counselling: "የምክር ድጋፍ",
    counsellingHint: "ስሜታዊ ደህንነት ወይም ማነጋገር",
    contactMethod: "እንዴት እንገናኝዎ?",
    email: "ኢሜይል",
    phone: "ስልክ",
    contactEmail: "የኢሜይል አድራሻ",
    contactPhone: "ስልክ ቁጥር",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+251 ...",
    summary: "በአጭሩ ምን ዓይነት ድጋፍ ይፈልጋሉ? (አማራጭ)",
    summaryPlaceholder: "አጠቃላይ ጉዳይ ብቻ ይጻፉ። ምርመራ፣ መድኃኒት ወይም አስቸኳይ ዝርዝር አያካትቱ።",
    consent: "የመገናኛ ዝርዝሬንና ጥያቄዬን ለተጨማሪ እርምጃ ከትሪኒቲ ጋር ለመላክና ለማስቀመጥ እስማማለሁ።",
    submit: "የእንክብካቤ ጥያቄ ላክ",
    submitting: "በመላክ ላይ…",
    invalidContact: "ትክክለኛ ኢሜይል ወይም ስልክ ቁጥር ያስገቡ።",
    consentRequired: "ከመላክዎ በፊት ይህን መረጃ ለማጋራት ፈቃድ ይስጡ።",
    failedTitle: "ጥያቄውን መላክ አልተቻለም",
    failedBody: "የኢንተርኔት ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ። ጥያቄዎ አልተረጋገጠም።",
    safetyTitle: "ለአስቸኳይ ሁኔታ አይደለም",
    safetyBody: "ይህ ቅጽ በቀጣይነት አይታይም፣ አስቸኳይ እርዳታም አይሰጥም። በአስቸኳይ አደጋ ላይ ከሆኑ የአካባቢዎን የአደጋ ጊዜ አገልግሎት ያነጋግሩ ወይም ወደ ጤና ተቋም ይሂዱ።",
    serviceNoticeTitle: "እባክዎ ያስተውሉ",
    serviceNoticeBody: "ሲልኩ ጥያቄው በመለያዎ ይቀመጣል። ቀጠሮ አይያዝም፤ ምላሽ ወይም ተጨማሪ እርምጃ የተረጋገጠ አይደለም። የሰራተኛ ግምገማና ቀጠሮ ስርዓት በዚህ መተግበሪያ ገና አልተገናኘም።",
    successTitle: "ጥያቄው ተቀምጧል",
    successBody: "ጥያቄዎ በመለያዎ ተመዝግቧል። ቀጠሮ አልተያዘም።",
    reference: "የመለያ ቁጥር",
    newRequest: "ሌላ ጥያቄ ላክ",
    myRequests: "የቅርብ ጊዜ ጥያቄዎችዎ",
    submitted: "ተልኳል",
    inReview: "በግምገማ ላይ",
    contacted: "ተገናኝተዋል",
    closed: "ተዘግቷል",
    noRequests: "እስካሁን ምንም ጥያቄ አልተላከም።",
    askOpal: "አጠቃላይ ትምህርት ይፈልጋሉ?",
    openLearning: "ትምህርቶችን ይመልከቱ",
    date: "የተፈጠረበት",
  },
} as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export default function CareRequestScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const language = useTrinityStore((state) => state.language);
  const authReturnTo = useTrinityStore((state) => state.authReturnTo);
  const setAuthReturnTo = useTrinityStore((state) => state.setAuthReturnTo);
  const t = copy[language];

  useEffect(() => {
    if (
      pathname === "/care" &&
      isLoaded &&
      isSignedIn &&
      authReturnTo === AUTHENTICATED_CARE_TAB
    ) {
      setAuthReturnTo(null);
    }
  }, [authReturnTo, isLoaded, isSignedIn, pathname, setAuthReturnTo]);

  const requests = useQuery(api.careRequests.listMine);
  const createRequest = useMutation(api.careRequests.create);
  const [requestType, setRequestType] = useState<RequestType>("clinical");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [contactDetails, setContactDetails] = useState("");
  const [requestSummary, setRequestSummary] = useState("");
  const [consented, setConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const contactValid =
    contactMethod === "email"
      ? isValidEmail(contactDetails)
      : isValidPhone(contactDetails);

  const submitRequest = async () => {
    if (!contactValid) {
      Alert.alert(t.invalidContact);
      return;
    }
    if (!consented) {
      Alert.alert(t.consentRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const id = await createRequest({
        consent: true,
        requestType,
        contactMethod,
        contactDetails: contactDetails.trim(),
        ...(requestSummary.trim()
          ? { requestSummary: requestSummary.trim() }
          : {}),
      });
      setSubmittedId(String(id));
    } catch (error) {
      console.error("Care request submission failed.", error);
      Alert.alert(t.failedTitle, t.failedBody);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedId(null);
    setRequestType("clinical");
    setContactMethod("email");
    setContactDetails("");
    setRequestSummary("");
    setConsented(false);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <View style={styles.accessContent}>
          <Text style={styles.eyebrow}>{t.eyebrow}</Text>
          <View style={styles.accessCard}>
            <Ionicons
              name={isLoaded ? "lock-closed-outline" : "time-outline"}
              size={26}
              color="#317A48"
            />
            <Text style={styles.accessTitle}>
              {isLoaded ? t.signInTitle : t.loading}
            </Text>
            {isLoaded ? (
              <>
                <Text style={styles.accessBody}>{t.signInBody}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setAuthReturnTo(AUTHENTICATED_CARE_TAB);
                    router.push("/sign-in" as Href);
                  }}
                  style={styles.accessButton}
                >
                  <Text style={styles.accessButtonText}>{t.signInAction}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>{t.eyebrow}</Text>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <Notice
            icon="alert-circle-outline"
            title={t.safetyTitle}
            body={t.safetyBody}
            tone="urgent"
          />
          <Notice
            icon="information-circle-outline"
            title={t.serviceNoticeTitle}
            body={t.serviceNoticeBody}
          />

          {submittedId ? (
            <View style={styles.successCard} accessibilityRole="alert">
              <Ionicons
                name="checkmark-circle-outline"
                size={26}
                color="#247640"
              />
              <Text style={styles.successTitle}>{t.successTitle}</Text>
              <Text style={styles.successText}>{t.successBody}</Text>
              <Text style={styles.referenceLabel}>{t.reference}</Text>
              <Text selectable style={styles.referenceValue}>
                {submittedId}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={resetForm}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>{t.newRequest}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>{t.requestType}</Text>
              <View style={styles.choiceGroup} accessibilityRole="radiogroup">
                <ChoiceCard
                  selected={requestType === "clinical"}
                  icon="medkit-outline"
                  title={t.clinical}
                  hint={t.clinicalHint}
                  onPress={() => setRequestType("clinical")}
                />
                <ChoiceCard
                  selected={requestType === "counselling"}
                  icon="chatbubbles-outline"
                  title={t.counselling}
                  hint={t.counsellingHint}
                  onPress={() => setRequestType("counselling")}
                />
              </View>

              <Text style={styles.sectionTitle}>{t.contactMethod}</Text>
              <View style={styles.methodRow}>
                {(["email", "phone"] as const).map((method) => {
                  const active = method === contactMethod;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      key={method}
                      onPress={() => {
                        if (method !== contactMethod) {
                          setContactDetails("");
                          setContactMethod(method);
                        }
                      }}
                      style={[styles.methodButton, active && styles.methodActive]}
                    >
                      <Ionicons
                        name={method === "email" ? "mail-outline" : "call-outline"}
                        size={17}
                        color={active ? "#087A3D" : "#6F7F73"}
                      />
                      <Text style={[styles.methodText, active && styles.methodTextActive]}>
                        {method === "email" ? t.email : t.phone}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.inputLabel}>
                {contactMethod === "email" ? t.contactEmail : t.contactPhone}
              </Text>
              <TextInput
                accessibilityLabel={contactMethod === "email" ? t.contactEmail : t.contactPhone}
                autoCapitalize="none"
                autoComplete={contactMethod === "email" ? "email" : "tel"}
                keyboardType={contactMethod === "email" ? "email-address" : "phone-pad"}
                maxLength={254}
                onChangeText={setContactDetails}
                placeholder={contactMethod === "email" ? t.emailPlaceholder : t.phonePlaceholder}
                placeholderTextColor="#8B9A8E"
                style={styles.input}
                textContentType={contactMethod === "email" ? "emailAddress" : "telephoneNumber"}
                value={contactDetails}
              />

              <Text style={styles.inputLabel}>{t.summary}</Text>
              <TextInput
                accessibilityLabel={t.summary}
                maxLength={500}
                multiline
                onChangeText={setRequestSummary}
                placeholder={t.summaryPlaceholder}
                placeholderTextColor="#8B9A8E"
                style={[styles.input, styles.summaryInput]}
                textAlignVertical="top"
                value={requestSummary}
              />
              <Text style={styles.characterCount}>{requestSummary.length}/500</Text>

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consented }}
                onPress={() => setConsented((current) => !current)}
                style={styles.consentRow}
              >
                <View style={[styles.checkbox, consented && styles.checkboxSelected]}>
                  {consented && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.consentText}>{t.consent}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !consented || !contactValid || isSubmitting }}
                disabled={!consented || !contactValid || isSubmitting}
                onPress={() => void submitRequest()}
                style={({ pressed }) => [
                  styles.submitButton,
                  (!consented || !contactValid || isSubmitting) && styles.submitDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? t.submitting : t.submit}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </>
          )}

          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>{t.myRequests}</Text>
            {!requests?.length ? (
              <Text style={styles.emptyRequests}>{t.noRequests}</Text>
            ) : (
              requests.map((request) => (
                <View key={request._id} style={styles.requestCard}>
                  <View style={styles.requestTopRow}>
                    <Text style={styles.requestType}>
                      {request.requestType === "clinical" ? t.clinical : t.counselling}
                    </Text>
                    <Text style={styles.requestStatus}>
                      {t[request.status]}
                    </Text>
                  </View>
                  <Text style={styles.requestReference}>
                    {t.reference}: {request._id}
                  </Text>
                  <Text style={styles.requestDate}>
                    {t.date}: {new Date(request.createdAt).toLocaleDateString(language === "am" ? "am-ET" : "en-US")}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/public/learn" as Href)}
            style={styles.learningLink}
          >
            <Text style={styles.learningLinkText}>{t.askOpal}</Text>
            <Text style={styles.learningLinkButton}>{t.openLearning}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChoiceCard({
  selected,
  icon,
  title,
  hint,
  onPress,
}: {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choiceCard, selected && styles.choiceCardSelected]}
    >
      <View style={styles.choiceIcon}>
        <Ionicons name={icon} size={19} color="#317A48" />
      </View>
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceHint}>{hint}</Text>
      </View>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={18}
        color={selected ? "#25804A" : "#A0ADA2"}
      />
    </Pressable>
  );
}

function Notice({
  icon,
  title,
  body,
  tone = "normal",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  tone?: "normal" | "urgent";
}) {
  return (
    <View style={[styles.notice, tone === "urgent" && styles.urgentNotice]}>
      <Ionicons
        name={icon}
        size={20}
        color={tone === "urgent" ? "#98642B" : "#2E7846"}
      />
      <View style={styles.noticeCopy}>
        <Text style={[styles.noticeTitle, tone === "urgent" && styles.urgentTitle]}>
          {title}
        </Text>
        <Text style={styles.noticeText}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 },
  keyboardView: { flex: 1 },
  content: { padding: 18, paddingBottom: 34 },
  accessContent: { flex: 1, padding: 18, paddingTop: 24 },
  accessCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DFE8DF", borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 20 },
  accessTitle: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 17, marginTop: 10, textAlign: "center" },
  accessBody: { color: "#69786D", fontFamily: "Righteous_400Regular", fontSize: 11, lineHeight: 17, marginTop: 7, textAlign: "center" },
  accessButton: { alignItems: "center", backgroundColor: "#08783D", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 17, minHeight: 46, paddingHorizontal: 16 },
  accessButtonText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 11 },
  eyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    color: "#1C3524",
    fontFamily: "Righteous_400Regular",
    fontSize: 24,
    marginTop: 8,
  },
  subtitle: {
    color: "#69786D",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  notice: {
    alignItems: "flex-start",
    backgroundColor: "#EAF4EB",
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
    padding: 12,
  },
  urgentNotice: { backgroundColor: "#FFF5E6", borderColor: "#E9D2A5", borderWidth: 1 },
  noticeCopy: { flex: 1, gap: 4 },
  noticeTitle: { color: "#28583A", fontFamily: "Righteous_400Regular", fontSize: 11 },
  urgentTitle: { color: "#79531C" },
  noticeText: { color: "#607363", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15 },
  sectionTitle: {
    color: "#34493A",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    marginBottom: 9,
    marginTop: 20,
  },
  choiceGroup: { gap: 8 },
  choiceCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE8DF",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  choiceCardSelected: { backgroundColor: "#EEF7F0", borderColor: "#29804A" },
  choiceIcon: { alignItems: "center", backgroundColor: "#EAF4EB", borderRadius: 11, height: 36, justifyContent: "center", width: 36 },
  choiceCopy: { flex: 1, gap: 4 },
  choiceTitle: { color: "#2D5239", fontFamily: "Righteous_400Regular", fontSize: 11 },
  choiceHint: { color: "#748378", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 13 },
  methodRow: { flexDirection: "row", gap: 8 },
  methodButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DFE8DF", borderRadius: 11, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 42 },
  methodActive: { backgroundColor: "#EEF7F0", borderColor: "#29804A" },
  methodText: { color: "#6F7F73", fontFamily: "Righteous_400Regular", fontSize: 10 },
  methodTextActive: { color: "#087A3D" },
  inputLabel: { color: "#35483A", fontFamily: "Righteous_400Regular", fontSize: 11, marginBottom: 7, marginTop: 16 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#DFE8DF", borderRadius: 12, borderWidth: 1, color: "#263A2D", fontFamily: "Righteous_400Regular", fontSize: 12, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10 },
  summaryInput: { minHeight: 88, paddingTop: 11 },
  characterCount: { color: "#879489", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 4, textAlign: "right" },
  consentRow: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginTop: 18 },
  checkbox: { alignItems: "center", borderColor: "#9BAE9E", borderRadius: 5, borderWidth: 1, height: 19, justifyContent: "center", marginTop: 1, width: 19 },
  checkboxSelected: { backgroundColor: "#24804A", borderColor: "#24804A" },
  consentText: { color: "#536458", flex: 1, fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15 },
  submitButton: { alignItems: "center", backgroundColor: "#08783D", borderRadius: 14, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 17, minHeight: 48 },
  submitDisabled: { backgroundColor: "#A9BBAE" },
  submitText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 12 },
  pressed: { opacity: 0.82 },
  successCard: { alignItems: "center", backgroundColor: "#EAF4EB", borderColor: "#C9DFCC", borderRadius: 16, borderWidth: 1, marginTop: 18, padding: 17 },
  successTitle: { color: "#245D37", fontFamily: "Righteous_400Regular", fontSize: 15, marginTop: 8 },
  successText: { color: "#607363", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15, marginTop: 5, textAlign: "center" },
  referenceLabel: { color: "#718075", fontFamily: "Righteous_400Regular", fontSize: 9, marginTop: 13 },
  referenceValue: { color: "#294433", fontFamily: "Righteous_400Regular", fontSize: 14, marginTop: 3 },
  secondaryButton: { alignItems: "center", borderColor: "#A9C5AD", borderRadius: 12, borderWidth: 1, marginTop: 14, minHeight: 40, justifyContent: "center", paddingHorizontal: 15 },
  secondaryButtonText: { color: "#357347", fontFamily: "Righteous_400Regular", fontSize: 10 },
  requestsSection: { marginTop: 10 },
  emptyRequests: { color: "#7B897E", fontFamily: "Righteous_400Regular", fontSize: 10, paddingBottom: 9 },
  requestCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 12, borderWidth: 1, marginBottom: 8, padding: 11 },
  requestTopRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  requestType: { color: "#2D5239", flex: 1, fontFamily: "Righteous_400Regular", fontSize: 10 },
  requestStatus: { backgroundColor: "#EEF7F0", borderRadius: 10, color: "#397548", fontFamily: "Righteous_400Regular", fontSize: 8, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4 },
  requestReference: { color: "#617266", fontFamily: "Righteous_400Regular", fontSize: 9, marginTop: 7 },
  requestDate: { color: "#879489", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 3 },
  learningLink: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingVertical: 10 },
  learningLinkText: { color: "#6C7C70", fontFamily: "Righteous_400Regular", fontSize: 9 },
  learningLinkButton: { color: "#087A3D", fontFamily: "Righteous_400Regular", fontSize: 9, textDecorationLine: "underline" },
});
