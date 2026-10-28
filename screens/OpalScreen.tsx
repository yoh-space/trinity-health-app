import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
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
  getEducationContent,
  type EducationItem,
} from "../components/public/educationContent";
import {
  classifyOpalQuestion,
  getOpalSafetyResponse,
} from "../lib/opal/safety";
import { useTrinityStore } from "../store/useTrinityStore";

type Question = {
  id: string;
  lessonId: string;
  sectionIndex: number;
  question: string;
  questionAm: string;
  keywords: string[];
};
type Message = {
  id: number;
  role: "user" | "opal";
  text: string;
  sourceId?: string;
  safety?: boolean;
};

const questions: Question[] = [
  {
    id: "food-hands",
    lessonId: "food-safety",
    sectionIndex: 0,
    question: "How can I keep food preparation clean?",
    questionAm: "ምግብ ሲዘጋጅ ንጽህናን እንዴት መጠበቅ እችላለሁ?",
    keywords: ["food", "clean", "hand", "wash", "hygiene", "እጅ", "ምግብ", "ንጽህና"],
  },
  {
    id: "pregnancy-food",
    lessonId: "pregnancy",
    sectionIndex: 0,
    question: "What foods can I choose during pregnancy?",
    questionAm: "በእርግዝና ጊዜ ምን ልመገብ?",
    keywords: ["pregnan", "pregnancy", "food", "eat", "እርግዝና", "መመገብ"],
  },
  {
    id: "child-texture",
    lessonId: "child-nutrition",
    sectionIndex: 0,
    question: "What texture is right for a young child?",
    questionAm: "ለታዳጊ ህፃን ምን ዓይነት ምግብ ማዘጋጀት አለብኝ?",
    keywords: ["child", "baby", "texture", "feed", "ህፃን", "ህጻን", "ልጅ"],
  },
  {
    id: "breastfeeding-water",
    lessonId: "breastfeeding",
    sectionIndex: 1,
    question: "What should I drink while breastfeeding?",
    questionAm: "ጡት በማጥባት ጊዜ ምን መጠጣት አለብኝ?",
    keywords: ["breastfeed", "nursing", "drink", "water", "ጡት", "ማጥባት", "ውሃ"],
  },
  {
    id: "safe-water",
    lessonId: "safe-water",
    sectionIndex: 2,
    question: "How do I make drinking water safe?",
    questionAm: "የመጠጥ ውሃን እንዴት ደህንነቱን መጠበቅ እችላለሁ?",
    keywords: ["water", "drink", "safe", "clean", "ውሃ", "መጠጥ"],
  },
];

function BottomNav({
  language,
  onNavigate,
}: {
  language: "am" | "en";
  onNavigate: (path: Href) => void;
}) {
  const am = language === "am";
  const items = [
    ["Home", "መነሻ", "home-outline", "/public/home"],
    ["Learn", "ትምህርት", "book-outline", "/public/learn"],
    ["Meals", "ምግብ", "restaurant-outline", "/public/food"],
    ["Care", "እንክብካቤ", "heart-outline", "/public/care"],
  ] as const;
  return (
    <View style={styles.bottomNav}>
      {items.map(([label, labelAm, icon, path], index) => {
        const active = index === 3;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={am ? labelAm : label}
            key={label}
            onPress={() => onNavigate(path)}
            style={styles.bottomNavItem}
          >
            <View
              style={[styles.bottomIcon, active && styles.bottomIconActive]}
            >
              <Ionicons
                color={active ? "#2D7D49" : "#77857B"}
                name={icon}
                size={17}
              />
            </View>
            <Text
              style={[styles.bottomLabel, active && styles.bottomLabelActive]}
            >
              {am ? labelAm : label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function OpalScreen() {
  const router = useRouter();
  const language = useTrinityStore((state) => state.language);
  const published = useQuery(anyApi.education.listPublished) as
    | EducationItem[]
    | undefined;
  const content = getEducationContent(published);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const nextMessageId = useRef(0);
  const am = language === "am";

  const answerQuestion = (text: string, preferredId?: string) => {
    const intent = classifyOpalQuestion(text);
    const normalized = text.toLocaleLowerCase();
    const matched =
      intent === "safe"
        ? (questions.find((q) => q.id === preferredId) ??
          questions
            .map((q) => ({
              q,
              score: q.keywords.filter((k) =>
                normalized.includes(k.toLocaleLowerCase()),
              ).length,
            }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)[0]?.q)
        : undefined;
    const lesson = matched
      ? content.find((item) => item._id === matched.lessonId)
      : undefined;
    const section =
      lesson?.sections?.[matched?.sectionIndex ?? -1] ?? lesson?.sections?.[0];
    const response =
      intent !== "safe"
        ? getOpalSafetyResponse(intent, language)
        : lesson
          ? section
            ? am
              ? section.bodyAm
              : section.body
            : am
              ? lesson.contentAm
              : lesson.content
          : am
            ? "በአሁኑ ጊዜ በተዘጋጁ የትምህርት ማስታወሻዎች ውስጥ ለዚህ ጥያቄ መልስ የለኝም። ከብቁ የጤና ባለሙያ ጋር ይነጋገሩ።"
            : "I can only help with questions covered by the prepared learning notes. I don’t have a source-backed answer for this one; please ask a qualified health professional.";
    setMessages((previous) => [
      ...previous,
      { id: nextMessageId.current++, role: "user", text },
      {
        id: nextMessageId.current++,
        role: "opal",
        text: response,
        ...(intent !== "safe" ? { safety: true } : {}),
        ...(lesson ? { sourceId: lesson._id } : {}),
      },
    ]);
    setDraft("");
  };
  const submitDraft = () => {
    const text = draft.trim();
    if (text) answerQuestion(text);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
        >
          <Text style={styles.eyebrow}>
            {am ? "ትንሽ መመሪያ" : "A LITTLE GUIDANCE"}
          </Text>
          <Text style={styles.title}>{am ? "ኦፓልን ይጠይቁ" : "Ask Opal"}</Text>
          <Text style={styles.subtitle}>
            {am
              ? "መልሶች ከዚህ ማሳያ ውስጥ ከተካተቱ ማስታወሻዎች ይመጣሉ።"
              : "Answers matched from notes bundled inside this prototype."}
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
                    ? "ከታች ያለውን ጥያቄ ይምረጡ ወይም የራስዎን ይጻፉ።"
                    : "Pick a question below or type your own. I can share notes on food safety, water, pregnancy, breastfeeding, and feeding young children."}
                </Text>
              </View>
            </View>
          )}
          {!!messages.length && (
            <View style={styles.messageList}>
              {messages.map((message) => {
                const isOpal = message.role === "opal";
                const source = message.sourceId
                  ? content.find((item) => item._id === message.sourceId)
                  : undefined;
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
                      {source && (
                        <Pressable
                          accessibilityRole="link"
                          onPress={() =>
                            router.push(
                              `/public/article/${encodeURIComponent(source._id)}` as Href,
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
                      )}
                    </View>
                  </View>
                );
              })}
              <Pressable
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
                onPress={() =>
                  answerQuestion(
                    am ? question.questionAm : question.question,
                    question.id,
                  )
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
              disabled={!draft.trim()}
              onPress={submitDraft}
              style={[styles.sendButton, !draft.trim() && styles.sendDisabled]}
            >
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>
            {am
              ? "ስም፣ ስልክ ቁጥር ወይም የጤና ዝርዝር አይጻፉ። መልዕክቶች ለዚህ ክፍለ ጊዜ ብቻ ናቸው።"
              : "Please don't type names, phone numbers, or health details. Messages stay on this screen for this session only."}
          </Text>
        </View>
        <BottomNav
          language={language}
          onNavigate={(path) => router.replace(path)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F8FBF8", flex: 1 },
  keyboardView: { flex: 1 },
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
  bottomNav: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E2EAE3",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    minHeight: 61,
    paddingTop: 5,
  },
  bottomNavItem: { alignItems: "center", flex: 1 },
  bottomIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 27,
    justifyContent: "center",
    width: 34,
  },
  bottomIconActive: { backgroundColor: "#E5F2E7" },
  bottomLabel: {
    color: "#77857B",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    marginTop: 1,
  },
  bottomLabelActive: { color: "#2D7D49", fontFamily: "Righteous_400Regular" },
});
