import { Ionicons } from "@expo/vector-icons";
import { useAction } from "convex/react";
import { anyApi } from "convex/server";
import { useRouter, type Href } from "expo-router";
import { useRef, useState } from "react";
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
import { GuestHomeHeader } from "../components/public/GuestHomeHeader";
import {
  classifyOpalQuestion,
  containsLikelyPersonalDetails,
  getOpalPrivacyResponse,
  getOpalSafetyResponse,
} from "../lib/opal/safety";
import { useTrinityStore } from "../store/useTrinityStore";

type Question = {
  id: string;
  question: string;
  questionAm: string;
};
type OpalSource = { id: string; title: string; titleAm: string };
type Message = {
  id: number;
  role: "user" | "opal";
  text: string;
  sources?: OpalSource[];
  safety?: boolean;
  error?: boolean;
};
type AskOpalResult = {
  answer: string;
  safety: boolean;
  sources: OpalSource[];
};

const questions: Question[] = [
  {
    id: "food-hands",
    question: "How can I keep food preparation clean?",
    questionAm: "ምግብ ሲዘጋጅ ንጽህናን እንዴት መጠበቅ እችላለሁ?",
  },
  {
    id: "pregnancy-food",
    question: "What foods can I choose during pregnancy?",
    questionAm: "በእርግዝና ጊዜ ምን ልመገብ?",
  },
  {
    id: "child-texture",
    question: "What texture is right for a young child?",
    questionAm: "ለታዳጊ ህፃን ምን ዓይነት ምግብ ማዘጋጀት አለብኝ?",
  },
  {
    id: "breastfeeding-water",
    question: "What should I drink while breastfeeding?",
    questionAm: "ጡት በማጥባት ጊዜ ምን መጠጣት አለብኝ?",
  },
  {
    id: "safe-water",
    question: "How do I make drinking water safe?",
    questionAm: "የመጠጥ ውሃን እንዴት ደህንነቱን መጠበቅ እችላለሁ?",
  },
];

export default function OpalScreen() {
  const router = useRouter();
  const language = useTrinityStore((state) => state.language);
  const askOpal = useAction(anyApi.opal.ask);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const nextMessageId = useRef(0);
  const am = language === "am";

  const sendToGemini = async (text: string) => {
    const userMessageId = nextMessageId.current++;
    const opalMessageId = nextMessageId.current++;
    setMessages((previous) => [
      ...previous,
      { id: userMessageId, role: "user", text },
    ]);
    setDraft("");
    setIsSending(true);

    try {
      const result = (await askOpal({
        consented: true,
        language,
        question: text,
      })) as AskOpalResult;
      setMessages((previous) => [
        ...previous,
        {
          id: opalMessageId,
          role: "opal",
          text: result.answer,
          safety: result.safety,
          sources: result.sources,
        },
      ]);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      let message: string;
      if (code.includes("OPAL_NOT_CONFIGURED")) {
        message = am
          ? "ኦፓል ገና ከGemini ጋር አልተገናኘም። በConvex ቅንብሮች ውስጥ GEMINI_API_KEY ያክሉ።"
          : "Opal is not connected to Gemini yet. Add GEMINI_API_KEY in Convex environment settings.";
      } else if (code.includes("OPAL_RATE_LIMIT")) {
        message = am
          ? "የGemini ነፃ የጥያቄ ገደብ ደርሷል። ቆይተው እንደገና ይሞክሩ።"
          : "Gemini’s free request limit has been reached. Please try again later.";
      } else if (code.includes("OPAL_INVALID_API_KEY")) {
        message = am
          ? "የGemini API ቁልፉ አልሰራም። በConvex ቅንብሮች ውስጥ GEMINI_API_KEYን ያረጋግጡ።"
          : "The Gemini API key was rejected. Check GEMINI_API_KEY in Convex settings.";
      } else {
        message = am
          ? "ኦፓል አሁን መልስ ማግኘት አልቻለም። ኢንተርኔትዎን ያረጋግጡና እንደገና ይሞክሩ።"
          : "Opal couldn’t get an answer right now. Check your connection and try again.";
      }
      setMessages((previous) => [
        ...previous,
        { id: opalMessageId, role: "opal", text: message, error: true },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const requestAnswer = (rawText: string) => {
    const text = rawText.trim();
    if (!text || isSending) return;

    if (text.length > 1000) {
      setMessages((previous) => [
        ...previous,
        {
          id: nextMessageId.current++,
          role: "opal",
          text: am
            ? "ጥያቄው በጣም ረጅም ነው። እስከ 1000 ፊደላት ድረስ ያሳጥሩት።"
            : "That question is too long. Please shorten it to 1,000 characters or less.",
          error: true,
        },
      ]);
      return;
    }

    if (containsLikelyPersonalDetails(text)) {
      setMessages((previous) => [
        ...previous,
        {
          id: nextMessageId.current++,
          role: "opal",
          text: getOpalPrivacyResponse(language),
          safety: true,
        },
      ]);
      setDraft("");
      return;
    }

    const safetyIntent = classifyOpalQuestion(text);
    if (safetyIntent !== "safe") {
      const userMessageId = nextMessageId.current++;
      const opalMessageId = nextMessageId.current++;
      setMessages((previous) => [
        ...previous,
        { id: userMessageId, role: "user", text },
        {
          id: opalMessageId,
          role: "opal",
          text: getOpalSafetyResponse(safetyIntent, language),
          safety: true,
        },
      ]);
      setDraft("");
      return;
    }

    if (aiConsent) {
      void sendToGemini(text);
      return;
    }

    Alert.alert(
      am ? "Gemini የሚቀበለው መረጃ" : "What Gemini will receive",
      am
        ? "ኦፓል አጠቃላይ የጤና ትምህርት ይሰጣል፤ የግል ምርመራ ወይም ሕክምና አይሰጥም። ጥያቄዎንና ተዛማጅ የታተመ የትምህርት ጽሑፍን ለGoogle Gemini ይልካል። የመገለጫዎ መረጃና የውይይት ታሪክ አይላኩም። በነፃ ደረጃ Google የሚላኩ ጥያቄዎችንና መልሶችን ምርቶቹን ለማሻሻል ሊጠቀምባቸው እና የሰው ገምጋሚዎች ሊያዩአቸው ይችላሉ። ስም፣ የመገናኛ ወይም የግል የጤና መረጃ አያስገቡ።"
        : "Opal provides general health education, not personal diagnosis or treatment. It sends your question and relevant published lesson text to Google Gemini. Your onboarding profile and earlier chat messages are not sent. On the free tier, Google may use submitted questions and answers to improve its products, and human reviewers may review them. Don’t include names, contact details, or personal health information.",
      [
        { text: am ? "ተመለስ" : "Cancel", style: "cancel" },
        {
          text: am ? "እስማማለሁ እና ቀጥል" : "Agree & continue",
          onPress: () => {
            setAiConsent(true);
            void sendToGemini(text);
          },
        },
      ],
    );
  };

  const submitDraft = () => {
    requestAnswer(draft);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.pageHeader}>
          <GuestHomeHeader
            language={language}
            onHomePress={() => router.replace("/public/home" as Href)}
            onSavedPress={() => router.push("/public/saved" as Href)}
            onSettingsPress={() =>
              Alert.alert(
                am ? "ቅንብሮች" : "Settings",
                am
                  ? "የቋንቋ ቅንብሮችን ከመነሻ ገጽ ይክፈቱ።"
                  : "Open the language settings from the Home screen.",
              )
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.conversation}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.conversationScroll}
        >
          <Text style={styles.eyebrow}>
            {am ? "ትንሽ መመሪያ" : "A LITTLE GUIDANCE"}
          </Text>
          <Text style={styles.title}>{am ? "ኦፓልን ይጠይቁ" : "Ask Opal"}</Text>
          <Text style={styles.subtitle}>
            {am
              ? "ከተዛማጅ የታተሙ ትምህርቶች ጋር Gemini አጠቃላይ መልስ ይሰጣል።"
              : "Gemini gives general answers using relevant published lessons."}
          </Text>
          {!messages.length && (
            <View style={styles.welcomeRow}>
              <View style={styles.leafBadge}>
                <Ionicons name="leaf" size={18} color="#2E8A4D" />
              </View>
              <View style={styles.welcomeBubble}>
                <Text style={styles.welcomeTitle}>
                  {am ? "ሰላም! ምን እንመርምር?" : "Selam! What shall we explore?"}
                </Text>
                <Text style={styles.welcomeText}>
                  {am
                    ? "ከታች ያለውን ይምረጡ ወይም አጠቃላይ ጥያቄ ይጻፉ። የመገለጫ መረጃዎ አይላክም።"
                    : "Pick a question below or ask your own general question. Your onboarding profile is not sent."}
                </Text>
              </View>
            </View>
          )}
          {!!messages.length && (
            <View style={styles.messageList}>
              {messages.map((message) => {
                const isOpal = message.role === "opal";
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      !isOpal && styles.userMessageRow,
                    ]}
                  >
                    {isOpal && (
                      <View style={styles.messageLeaf}>
                        <Ionicons name="leaf" size={13} color="#2E8A4D" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isOpal
                          ? message.safety
                            ? styles.safetyBubble
                            : message.error
                              ? styles.errorBubble
                              : styles.opalBubble
                          : styles.userBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          !isOpal && styles.userMessageText,
                        ]}
                      >
                        {message.text}
                      </Text>
                      {message.sources?.map((source) => (
                        <Pressable
                          accessibilityRole="link"
                          key={source.id}
                          onPress={() =>
                            router.push(
                              `/public/article/${encodeURIComponent(source.id)}` as Href,
                            )
                          }
                          style={styles.sourceLink}
                        >
                          <Ionicons
                            name="book-outline"
                            size={13}
                            color="#087A3D"
                          />
                          <Text style={styles.sourceLinkText}>
                            {am ? "ምንጭ" : "Read source"}:{" "}
                            {am ? source.titleAm : source.title}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}
              {isSending && (
                <View style={styles.messageRow}>
                  <View style={styles.messageLeaf}>
                    <Ionicons name="leaf" size={13} color="#2E8A4D" />
                  </View>
                  <View style={[styles.messageBubble, styles.opalBubble]}>
                    <Text style={styles.messageText}>
                      {am ? "ኦፓል እያሰበ ነው..." : "Opal is thinking..."}
                    </Text>
                  </View>
                </View>
              )}
              <Pressable
                disabled={isSending}
                onPress={() => setMessages([])}
                style={styles.resetButton}
              >
                <Ionicons name="refresh-outline" size={14} color="#438451" />
                <Text style={styles.resetText}>
                  {am ? "አዲስ ውይይት ጀምር" : "Start a new conversation"}
                </Text>
              </Pressable>
            </View>
          )}
          <View style={styles.quickQuestions}>
            {[questions[0], questions[4]].map((question) => (
              <Pressable
                accessibilityRole="button"
                key={question.id}
                disabled={isSending}
                onPress={() =>
                  requestAnswer(am ? question.questionAm : question.question)
                }
                style={({ pressed }) => [
                  styles.quickQuestion,
                  pressed && styles.quickQuestionPressed,
                ]}
              >
                <Text numberOfLines={1} style={styles.quickQuestionText}>
                  {am
                    ? question.id === "food-hands"
                      ? "የምግብ ደህንነት ትምህርት አሳየኝ"
                      : "የመጠጥ ውሃን ደህንነት እንዴት እጠብቅ?"
                    : question.id === "food-hands"
                      ? "Show me a food-safety lesson"
                      : "How do I keep drinking water safe?"}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <View style={styles.composerSection}>
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel={am ? "ጥያቄዎን ይጻፉ" : "Ask Opal a question"}
              onChangeText={setDraft}
              editable={!isSending}
              onSubmitEditing={submitDraft}
              placeholder={
                am
                  ? "ስለ ምግብ፣ ውሃ ወይም ንጽህና ይጠይቁ..."
                  : "Ask about food, water or hygiene..."
              }
              placeholderTextColor="#9AA79D"
              returnKeyType="send"
              style={styles.input}
              value={draft}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={am ? "ጥያቄ ላክ" : "Send question"}
              disabled={!draft.trim() || isSending}
              onPress={submitDraft}
              style={[
                styles.sendButton,
                (!draft.trim() || isSending) && styles.sendDisabled,
              ]}
            >
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>
            {am
              ? "አጠቃላይ ትምህርት ብቻ ነው። የመገለጫ መረጃ አይላክም፤ የግል ዝርዝሮችን አያስገቡ።"
              : "General education only. Your profile isn’t sent; don’t include personal details."}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F8FBF8", flex: 1 },
  keyboardView: { flex: 1 },
  conversationScroll: { flex: 1 },
  pageHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E2EAE3",
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 5,
  },
  conversation: { paddingBottom: 10, paddingHorizontal: 15, paddingTop: 13 },
  eyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 1.2,
  },
  title: {
    color: "#203A28",
    fontFamily: "Righteous_400Regular",
    fontSize: 24,
    lineHeight: 29,
    marginTop: 4,
  },
  subtitle: {
    color: "#718075",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  welcomeRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginTop: 18,
  },
  leafBadge: {
    alignItems: "center",
    backgroundColor: "#E5F2E7",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    marginTop: 3,
    width: 28,
  },
  welcomeBubble: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8DF",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  welcomeTitle: { color: "#203A28", fontFamily: "Righteous_400Regular", fontSize: 11 },
  welcomeText: {
    color: "#657568",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
  },
  messageList: { marginTop: 17 },
  messageRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  userMessageRow: { justifyContent: "flex-end" },
  messageLeaf: {
    alignItems: "center",
    backgroundColor: "#E5F2E7",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  messageBubble: { borderRadius: 13, maxWidth: "86%", padding: 10 },
  opalBubble: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8DF",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  safetyBubble: {
    backgroundColor: "#FFF8E8",
    borderColor: "#E6C982",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: "#FFF1EE",
    borderColor: "#EBC6BD",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: { backgroundColor: "#347346", borderBottomRightRadius: 4 },
  messageText: {
    color: "#435649",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  userMessageText: { color: "#FFFFFF" },
  sourceLink: {
    alignItems: "center",
    backgroundColor: "#EEF6EF",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  sourceLinkText: {
    color: "#087A3D",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    lineHeight: 11,
  },
  resetButton: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
    padding: 7,
  },
  resetText: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 9 },
  quickQuestions: { flexDirection: "row", gap: 7, marginTop: 15 },
  quickQuestion: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DEE8DF",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  quickQuestionPressed: { backgroundColor: "#EEF7EF" },
  quickQuestionText: {
    color: "#4B6751",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    textAlign: "center",
  },
  composerSection: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E2EAE3",
    borderTopWidth: 1,
    paddingHorizontal: 13,
    paddingTop: 8,
  },
  composer: { alignItems: "center", flexDirection: "row", gap: 7 },
  input: {
    backgroundColor: "#F4F8F4",
    borderColor: "#CFE0D2",
    borderRadius: 18,
    borderWidth: 1,
    color: "#2A4431",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    height: 38,
    paddingHorizontal: 12,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#73B589",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  sendDisabled: { backgroundColor: "#AFC7B4" },
  disclaimer: {
    color: "#829087",
    fontFamily: "Righteous_400Regular",
    fontSize: 7,
    lineHeight: 10,
    marginHorizontal: 4,
    marginTop: 5,
    textAlign: "center",
  },
});
