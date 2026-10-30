import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Platform,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ONBOARDING_PROFILE_KEY } from "../lib/onboarding/secureProfile";
import { useTrinityStore } from "../store/useTrinityStore";

const copy = {
  am: {
    eyebrow: "በእርስዎ መንገድ",
    title: "ቅንብሮች",
    languageHeading: "የመተግበሪያ ቋንቋ",
    english: "English",
    englishSub: "A little learning. A lot of care.",
    amharic: "አማርኛ",
    amharicSub: "ትንሽ እውቀት፣ ብዙ እንክብካቤ",
    controlHeading: "እርስዎ ይቆጣጠሩታል",
    preferenceTitle: "አማራጭ የግል ምርጫ",
    preferenceSummary: "አጠቃላይ ትምህርቶች · መገለጫ አማራጭ ነው",
    changePreferences: "ምርጫን ቀይር",
    privacyTitle: "የመሣሪያዎ ውሂብ",
    privacyCopy:
      "የመግቢያ መልሶችዎን በዚህ መሣሪያ ላይ የሚያስቀምጡት ‘በዚህ መሣሪያ ላይ ያስቀምጡ’ ከመረጡ ብቻ ነው። ወደ መለያ የተቀመጠ መገለጫ የተለየ ነው።",
    privacyDetail:
      "የአካባቢ ውሂብን ማጥፋት በዚህ መሣሪያ የተቀመጡ መልሶችን እና የአሁኑን የቋንቋ/ትምህርት ምርጫዎች ያጸዳል፤ የመለያ መገለጫዎን አያጠፋም።",
    clearData: "የአካባቢ ውሂብ አጥፋ",
    staffDemo: "የሠራተኛ መግቢያ (ሙከራ)",
    askOpal: "ኦፓልን ጠይቅ",
    home: "መነሻ",
    saved: "የተቀመጡ ትምህርቶች",
    back: "ተመለስ",
    confirmTitle: "የአካባቢ ውሂብ ይጠፋ?",
    confirmCopy:
      "በዚህ መሣሪያ የተቀመጡ የመግቢያ መልሶች ይሰረዛሉ። የመለያ መገለጫዎ አይሰረዝም።",
    cancel: "ይቅር",
    confirm: "የአካባቢ ውሂብ አጥፋ",
    cleared: "የአካባቢ ውሂብ ተጸድቷል።",
    clearFailed: "የተቀመጠውን የመሣሪያ መገለጫ ማጥፋት አልተቻለም። እንደገና ይሞክሩ።",
  },
  en: {
    eyebrow: "SETTINGS, YOUR WAY",
    title: "Settings",
    languageHeading: "App language",
    english: "English",
    englishSub: "A little learning. A lot of care.",
    amharic: "አማርኛ",
    amharicSub: "ትንሽ እውቀት፣ ብዙ እንክብካቤ",
    controlHeading: "You’re in control",
    preferenceTitle: "Optional personal preferences",
    preferenceSummary: "General lessons · a profile is optional",
    changePreferences: "Change preferences",
    privacyTitle: "On this device",
    privacyCopy:
      "Your onboarding answers are stored on this device only if you chose “Remember on this device.” A profile saved to your account is separate.",
    privacyDetail:
      "Clear local data removes remembered answers on this device and resets the current language and saved-lesson selections. It does not delete your account profile.",
    clearData: "Clear local data",
    staffDemo: "Staff portal (demo)",
    askOpal: "Ask Opal",
    home: "Home",
    saved: "Saved lessons",
    back: "Go back",
    confirmTitle: "Clear local data?",
    confirmCopy:
      "Remembered onboarding answers on this device will be removed. Your account profile will not be deleted.",
    cancel: "Cancel",
    confirm: "Clear local data",
    cleared: "Local data cleared.",
    clearFailed: "Could not remove the saved device profile. Please try again.",
  },
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const language = useTrinityStore((state) => state.language);
  const setLanguage = useTrinityStore((state) => state.setLanguage);
  const clearLocalData = useTrinityStore((state) => state.clearLocalData);
  const am = language === "am";
  const text = copy[language];
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [notice, setNotice] = useState<"cleared" | "error" | null>(null);

  const handleClearLocalData = async () => {
    setIsClearing(true);
    setNotice(null);
    try {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(ONBOARDING_PROFILE_KEY);
      }
      clearLocalData();
      setConfirmVisible(false);
      setNotice("cleared");
    } catch {
      setNotice("error");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text.back}
            onPress={() => router.replace("/public/home" as Href)}
            style={styles.headerIcon}
          >
            <Ionicons name={am ? "arrow-forward" : "arrow-back"} size={19} color="#345B40" />
          </Pressable>
          <View style={styles.brand}>
            <Image
              source={require("../assets/images/trinity-symbol.png")}
              resizeMode="contain"
              style={styles.brandMark}
            />
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>Trinity Health Solution</Text>
              <Text style={styles.brandTag}>A little learning. A lot of care.</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text.saved}
              onPress={() => router.push("/public/saved" as Href)}
              style={styles.headerIcon}
            >
              <Ionicons name="bookmark-outline" size={19} color="#365B41" />
            </Pressable>
            <View style={[styles.headerIcon, styles.headerIconActive]}>
              <Ionicons name="settings-outline" size={19} color="#087A3D" />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>{text.eyebrow}</Text>
          <Text style={styles.title}>{text.title}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{text.languageHeading}</Text>
            <View style={styles.languageRow}>
              <LanguageOption
                title={text.amharic}
                subtitle={text.amharicSub}
                selected={am}
                onPress={() => {
                  setLanguage("am");
                  setNotice(null);
                }}
              />
              <LanguageOption
                title={text.english}
                subtitle={text.englishSub}
                selected={!am}
                onPress={() => {
                  setLanguage("en");
                  setNotice(null);
                }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{text.controlHeading}</Text>
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="options-outline" size={18} color="#278047" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{text.preferenceTitle}</Text>
                <Text style={styles.cardSummary}>{text.preferenceSummary}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/onboarding" as Href)}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryButtonText}>{text.changePreferences}</Text>
                  <Ionicons name={am ? "arrow-back" : "arrow-forward"} size={15} color="#315E3C" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#278047" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{text.privacyTitle}</Text>
                <Text style={styles.bodyCopy}>{text.privacyCopy}</Text>
                <View style={styles.divider} />
                <Text style={styles.bodyCopy}>{text.privacyDetail}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setNotice(null);
                    setConfirmVisible(true);
                  }}
                  style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={16} color="#B0443E" />
                  <Text style={styles.dangerButtonText}>{text.clearData}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {notice ? (
            <View style={[styles.notice, notice === "error" && styles.errorNotice]}>
              <Ionicons
                name={notice === "cleared" ? "checkmark-circle-outline" : "alert-circle-outline"}
                size={16}
                color={notice === "cleared" ? "#287345" : "#A8423C"}
              />
              <Text style={[styles.noticeText, notice === "error" && styles.errorText]}>
                {notice === "cleared" ? text.cleared : text.clearFailed}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/staff-portal" as Href)}
            style={({ pressed }) => [styles.staffButton, pressed && styles.pressed]}
          >
            <Ionicons name="briefcase-outline" size={16} color="#42634A" />
            <Text style={styles.staffButtonText}>{text.staffDemo}</Text>
            <Ionicons name={am ? "arrow-back" : "arrow-forward"} size={15} color="#67836B" />
          </Pressable>
          <View style={styles.bottomSpace} />
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text.askOpal}
          onPress={() => router.push("/public/opal" as Href)}
          style={({ pressed }) => [styles.opalButton, pressed && styles.pressed]}
        >
          <Ionicons name="sparkles-outline" size={15} color="#FFFFFF" />
          <Text style={styles.opalButtonText}>{text.askOpal}</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmVisible(false)}>
          <Pressable style={styles.confirmCard} onPress={() => undefined}>
            <View style={styles.confirmIcon}>
              <Ionicons name="trash-outline" size={21} color="#B0443E" />
            </View>
            <Text style={styles.confirmTitle}>{text.confirmTitle}</Text>
            <Text style={styles.confirmCopy}>{text.confirmCopy}</Text>
            <Pressable
              accessibilityRole="button"
              disabled={isClearing}
              onPress={() => void handleClearLocalData()}
              style={({ pressed }) => [styles.confirmDangerButton, pressed && styles.pressed]}
            >
              <Text style={styles.confirmDangerText}>
                {isClearing ? (am ? "በማጽዳት ላይ…" : "Clearing…") : text.confirm}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isClearing}
              onPress={() => setConfirmVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>{text.cancel}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

type LanguageOptionProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

function LanguageOption({ title, subtitle, selected, onPress }: LanguageOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.languageOption, selected && styles.languageOptionSelected]}
    >
      <View style={styles.languageOptionCopy}>
        <Text style={styles.languageTitle}>{title}</Text>
        <Text style={styles.languageSubtitle}>{subtitle}</Text>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={16} color="#138044" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7FAF7" },
  page: { flex: 1 },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4ECE5",
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2EAE3",
    backgroundColor: "#FFFFFF",
  },
  headerIconActive: { backgroundColor: "#EAF4EB" },
  brand: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 7 },
  brandMark: {
    width: 31,
    height: 31,
  },
  brandCopy: { flex: 1, minWidth: 0, gap: 2 },
  brandName: { color: "#23472E", fontFamily: "Righteous_400Regular", fontSize: 11 },
  brandTag: { color: "#77867A", fontFamily: "Righteous_400Regular", fontSize: 7 },
  headerActions: { flexDirection: "row", gap: 8 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 },
  eyebrow: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 10, letterSpacing: 0.8 },
  title: { color: "#1D3023", fontFamily: "Righteous_400Regular", fontSize: 24, lineHeight: 31, marginTop: 5 },
  section: { marginTop: 20 },
  sectionTitle: { color: "#283D2D", fontFamily: "Righteous_400Regular", fontSize: 15, lineHeight: 21, marginBottom: 9 },
  languageRow: { flexDirection: "row", gap: 10 },
  languageOption: {
    minHeight: 72,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1E9E2",
    backgroundColor: "#FFFFFF",
  },
  languageOptionSelected: { backgroundColor: "#EEF7EF", borderColor: "#82B28A" },
  languageOptionCopy: { flex: 1, minWidth: 0 },
  languageTitle: { color: "#2D4934", fontFamily: "Righteous_400Regular", fontSize: 12 },
  languageSubtitle: { color: "#718075", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 13, marginTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E9E2",
    backgroundColor: "#FFFFFF",
  },
  cardIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#EAF4EB",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { color: "#2C4332", fontFamily: "Righteous_400Regular", fontSize: 12, lineHeight: 18 },
  cardSummary: { color: "#728075", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15, marginTop: 4 },
  bodyCopy: { color: "#738176", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 16, marginTop: 7 },
  secondaryButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#DDE8DE",
    backgroundColor: "#F8FBF8",
  },
  secondaryButtonText: { color: "#315E3C", fontFamily: "Righteous_400Regular", fontSize: 11 },
  divider: { height: 1, backgroundColor: "#E9EEEA", marginTop: 12, marginBottom: 4 },
  dangerButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E6BDBA",
    backgroundColor: "#FFF9F8",
  },
  dangerButtonText: { color: "#A8423C", fontFamily: "Righteous_400Regular", fontSize: 11 },
  notice: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, paddingHorizontal: 3 },
  errorNotice: { alignItems: "flex-start" },
  noticeText: { flex: 1, color: "#287345", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15 },
  errorText: { color: "#A8423C" },
  staffButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE7DE",
    backgroundColor: "#FFFFFF",
  },
  staffButtonText: { flex: 1, color: "#42634A", fontFamily: "Righteous_400Regular", fontSize: 12 },
  opalButton: {
    position: "absolute",
    right: 16,
    bottom: 14,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#16803F",
    elevation: 5,
    shadowColor: "#123B20",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  opalButtonText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 12 },
  bottomSpace: { height: 8 },
  pressed: { opacity: 0.78 },
  modalBackdrop: { flex: 1, justifyContent: "center", padding: 22, backgroundColor: "#15251A80" },
  confirmCard: { padding: 18, borderRadius: 18, backgroundColor: "#FFFFFF" },
  confirmIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#FFF0EE",
  },
  confirmTitle: { color: "#263D2D", fontFamily: "Righteous_400Regular", fontSize: 17, lineHeight: 23, marginTop: 14 },
  confirmCopy: { color: "#6E7D71", fontFamily: "Righteous_400Regular", fontSize: 12, lineHeight: 18, marginTop: 8 },
  confirmDangerButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: "#B0443E",
  },
  confirmDangerText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 12 },
  cancelButton: { alignItems: "center", padding: 13, marginTop: 4 },
  cancelButtonText: { color: "#526957", fontFamily: "Righteous_400Regular", fontSize: 12 },
});
