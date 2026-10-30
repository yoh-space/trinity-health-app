import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrinityStore } from "../../../store/useTrinityStore";

const copy = {
  en: {
    eyebrow: "YOUR TRINITY ACCOUNT",
    title: "Your profile",
    subtitle: "The basics of your learning space.",
    account: "Account",
    memberFallback: "Trinity member",
    signedInFallback: "Signed in to Trinity Health Solution",
    language: "App language",
    languageHint: "Choose the language you’d like to use.",
    saved: "Saved learning",
    savedCount: (count: number) => `${count} ${count === 1 ? "lesson" : "lessons"} saved`,
    savedHint: "Lessons you’ve kept to come back to.",
  },
  am: {
    eyebrow: "የትሪኒቲ መለያዎ",
    title: "መገለጫዎ",
    subtitle: "የትምህርት ቦታዎን እዚህ ያብጁ።",
    account: "መለያ",
    memberFallback: "የትሪኒቲ አባል",
    signedInFallback: "ወደ ትሪኒቲ ሄልዝ ሶሉሽን ገብተዋል",
    language: "የመተግበሪያ ቋንቋ",
    languageHint: "መጠቀም የሚፈልጉትን ቋንቋ ይምረጡ።",
    saved: "የተቀመጡ ትምህርቶች",
    savedCount: (count: number) => `${count} ትምህርት ተቀምጧል`,
    savedHint: "ወደፊት ለማንበብ ያስቀመጧቸው ትምህርቶች።",
  },
} as const;

export default function ProfileScreen() {
  const { user } = useUser();
  const language = useTrinityStore((state) => state.language);
  const setLanguage = useTrinityStore((state) => state.setLanguage);
  const savedIds = useTrinityStore((state) => state.savedIds);
  const am = language === "am";
  const text = copy[language];
  const displayName = user?.fullName || user?.firstName || text.memberFallback;
  const email = user?.primaryEmailAddress?.emailAddress;
  const initial = displayName.trim().slice(0, 1).toLocaleUpperCase();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{text.eyebrow}</Text>
        <Text style={styles.title}>{text.title}</Text>
        <Text style={styles.subtitle}>{text.subtitle}</Text>

        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.accountCopy}>
            <Text style={styles.accountLabel}>{text.account}</Text>
            <Text numberOfLines={1} style={styles.accountName}>{displayName}</Text>
            <Text numberOfLines={1} style={styles.accountEmail}>
              {email || text.signedInFallback}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={19} color="#278047" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.language}</Text>
          <Text style={styles.sectionHint}>{text.languageHint}</Text>
          <View style={styles.languageCard}>
            <LanguageOption
              label="አማርኛ"
              selected={am}
              onPress={() => setLanguage("am")}
            />
            <LanguageOption
              label="English"
              selected={!am}
              onPress={() => setLanguage("en")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.saved}</Text>
          <View style={styles.savedCard}>
            <View style={styles.savedIcon}>
              <Ionicons name="bookmark-outline" size={18} color="#278047" />
            </View>
            <View style={styles.savedCopy}>
              <Text style={styles.savedCount}>{text.savedCount(savedIds.length)}</Text>
              <Text style={styles.savedHint}>{text.savedHint}</Text>
            </View>
            <Ionicons
              name={am ? "chevron-back" : "chevron-forward"}
              size={17}
              color="#8A9A8D"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type LanguageOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function LanguageOption({ label, selected, onPress }: LanguageOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.languageOption, selected && styles.languageOptionSelected]}
    >
      <Text style={[styles.languageOptionText, selected && styles.languageOptionTextSelected]}>
        {label}
      </Text>
      {selected ? <Ionicons name="checkmark-circle" size={16} color="#138044" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7FAF7" },
  content: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 28 },
  eyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 0.9,
  },
  title: {
    color: "#1D3023",
    fontFamily: "Righteous_400Regular",
    fontSize: 23,
    lineHeight: 29,
    marginTop: 4,
  },
  subtitle: {
    color: "#6D7B70",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  accountCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E2",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    marginTop: 17,
    padding: 13,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#EAF4EB",
    borderRadius: 15,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  avatarText: { color: "#24733E", fontFamily: "Righteous_400Regular", fontSize: 18 },
  accountCopy: { flex: 1, gap: 2 },
  accountLabel: {
    color: "#718075",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 0.3,
  },
  accountName: { color: "#2C4332", fontFamily: "Righteous_400Regular", fontSize: 11 },
  accountEmail: { color: "#7A877D", fontFamily: "Righteous_400Regular", fontSize: 8 },
  section: { marginTop: 17 },
  sectionTitle: { color: "#283D2D", fontFamily: "Righteous_400Regular", fontSize: 12 },
  sectionHint: {
    color: "#748176",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
  },
  languageCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E2",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    padding: 9,
  },
  languageOption: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E2",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 37,
    paddingHorizontal: 8,
  },
  languageOptionSelected: { backgroundColor: "#EEF7EF", borderColor: "#82B28A" },
  languageOptionText: { color: "#526657", fontFamily: "Righteous_400Regular", fontSize: 9 },
  languageOptionTextSelected: { color: "#24733E" },
  savedCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E2",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    padding: 12,
  },
  savedIcon: {
    alignItems: "center",
    backgroundColor: "#EAF4EB",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  savedCopy: { flex: 1, gap: 3 },
  savedCount: { color: "#2C4332", fontFamily: "Righteous_400Regular", fontSize: 10 },
  savedHint: { color: "#748176", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12 },
});
