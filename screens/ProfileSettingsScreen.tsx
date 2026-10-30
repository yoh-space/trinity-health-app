import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { useQuery } from "convex/react";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../convex/_generated/api";
import { AUTHENTICATED_PROFILE_TAB } from "../constants/authRoutes";
import { ONBOARDING_PROFILE_KEY } from "../lib/onboarding/secureProfile";
import { useTrinityStore } from "../store/useTrinityStore";

const copy = {
  en: {
    eyebrow: "YOUR TRINITY SPACE",
    brandTag: "A little learning. A lot of care.",
    title: "Profile & settings",
    subtitle: "Your account, preferences, and saved learning.",
    account: "Account",
    guestName: "Family member",
    guestSubtitle: "You can explore Trinity without an account.",
    signedIn: "Signed in",
    signIn: "Sign in or create an account",
    healthProfile: "Health profile",
    profileCardTitle: "Optional profile",
    healthProfileHint:
      "Optional details can help personalize your learning. You choose what to share.",
    checkingProfile: "Checking your account profile…",
    profileSaved: "Your optional profile is saved to your account.",
    profileEmpty: "No health profile is saved to your account yet.",
    profileGuest: "You can keep these answers on this device or save them to your account.",
    editProfile: "Review health profile",
    createProfile: "Set up optional profile",
    preferences: "Preferences",
    language: "App language",
    languageHint: "Choose the language you’d like to use.",
    amharic: "አማርኛ",
    amharicDetail: "Amharic",
    english: "English",
    englishDetail: "እንግሊዝኛ",
    saved: "Saved learning",
    savedCount: (count: number) => `${count} ${count === 1 ? "lesson" : "lessons"} saved`,
    savedHint: "Lessons you bookmarked to revisit.",
    privacy: "Privacy & data",
    privacyCardTitle: "Your data, your choice",
    privacyCopy:
      "Your account profile is saved when you choose to save it. Remembered onboarding answers on this device are separate.",
    deviceDataLabel: "On this device",
    privacyDetail:
      "Clear device data resets this app’s language and saved lesson selections, and removes any onboarding answers remembered on this device. It does not delete your account profile.",
    clearData: "Clear device data",
    cleared: "Device data cleared.",
    clearFailed: "Could not remove the remembered profile. Please try again.",
    more: "More",
    askOpal: "Ask Opal",
    askOpalHint: "General health education and learning support.",
    staffPortal: "Staff portal (demo)",
    staffPortalHint: "For Trinity team members.",
    accountActions: "Account actions",
    signOut: "Sign out",
    signOutHint: "Return to the family app. Your account stays saved.",
    signOutError: "Could not sign out. Check your connection and try again.",
    confirmClearTitle: "Clear device data?",
    confirmClearCopy:
      "This resets the language and saved lesson selections in this app and removes any onboarding answers remembered on this device. Your account profile will stay saved.",
    confirmSignOutTitle: "Sign out?",
    confirmSignOutCopy:
      "You’ll return to the family app. Your account profile will remain saved.",
    cancel: "Cancel",
    confirmClear: "Clear device data",
    confirmSignOut: "Sign out",
    working: "Please wait…",
    back: "Back",
    footerTag: "A little learning. A lot of care.",
  },
  am: {
    eyebrow: "የትሪኒቲ ቦታዎ",
    brandTag: "ትንሽ እውቀት፣ ብዙ እንክብካቤ",
    title: "መገለጫ እና ቅንብሮች",
    subtitle: "መለያዎ፣ ምርጫዎችዎ እና የተቀመጡ ትምህርቶች።",
    account: "መለያ",
    guestName: "የቤተሰብ አባል",
    guestSubtitle: "መለያ ሳይኖርዎትም ትሪኒቲን መጠቀም ይችላሉ።",
    signedIn: "ገብተዋል",
    signIn: "ይግቡ ወይም መለያ ይፍጠሩ",
    healthProfile: "የጤና መገለጫ",
    profileCardTitle: "አማራጭ መገለጫ",
    healthProfileHint:
      "አማራጭ መረጃዎች ትምህርቶችን ለእርስዎ ለማበጀት ይረዳሉ። ምን እንደሚያጋሩ እርስዎ ይወስናሉ።",
    checkingProfile: "የመለያ መገለጫዎን በመፈተሽ ላይ…",
    profileSaved: "አማራጭ መገለጫዎ በመለያዎ ውስጥ ተቀምጧል።",
    profileEmpty: "እስካሁን በመለያዎ ውስጥ የጤና መገለጫ አልተቀመጠም።",
    profileGuest: "መልሶቹን በዚህ መሣሪያ ማስቀመጥ ወይም ወደ መለያዎ ማስቀመጥ ይችላሉ።",
    editProfile: "የጤና መገለጫን ይመልከቱ",
    createProfile: "አማራጭ መገለጫ ይጀምሩ",
    preferences: "ምርጫዎች",
    language: "የመተግበሪያ ቋንቋ",
    languageHint: "መጠቀም የሚፈልጉትን ቋንቋ ይምረጡ።",
    amharic: "አማርኛ",
    amharicDetail: "Amharic",
    english: "English",
    englishDetail: "እንግሊዝኛ",
    saved: "የተቀመጡ ትምህርቶች",
    savedCount: (count: number) => `${count} ትምህርት ተቀምጧል`,
    savedHint: "ለወደፊት ያስቀመጧቸው ትምህርቶች።",
    privacy: "ግላዊነት እና ውሂብ",
    privacyCardTitle: "ውሂብዎ እና ምርጫዎ",
    privacyCopy:
      "ወደ መለያዎ ለማስቀመጥ ሲመርጡ መገለጫዎ ይቀመጣል። በዚህ መሣሪያ የሚታወሱ መልሶች የተለዩ ናቸው።",
    deviceDataLabel: "በዚህ መሣሪያ ላይ",
    privacyDetail:
      "የመሣሪያ ውሂብን ማጥፋት የቋንቋ እና የተቀመጡ ትምህርቶች ምርጫዎችን ይጀምራል፣ በመሣሪያው የታወሱ መልሶችንም ያስወግዳል። የመለያ መገለጫዎን አያጠፋም።",
    clearData: "የመሣሪያ ውሂብ አጥፋ",
    cleared: "የመሣሪያ ውሂብ ተጸድቷል።",
    clearFailed: "የታወሰውን መገለጫ ማስወገድ አልተቻለም። እንደገና ይሞክሩ።",
    more: "ተጨማሪ",
    askOpal: "ኦፓልን ይጠይቁ",
    askOpalHint: "አጠቃላይ የጤና ትምህርት እና የመማር ድጋፍ።",
    staffPortal: "የሠራተኛ መግቢያ (ሙከራ)",
    staffPortalHint: "ለትሪኒቲ ቡድን አባላት።",
    accountActions: "የመለያ እርምጃዎች",
    signOut: "ውጣ",
    signOutHint: "ወደ ቤተሰብ መተግበሪያ ይመለሱ። መለያዎ አይጠፋም።",
    signOutError: "መውጣት አልተቻለም። ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።",
    confirmClearTitle: "የመሣሪያ ውሂብ ይጠፋ?",
    confirmClearCopy:
      "ይህ በመተግበሪያው ያሉ የቋንቋ እና የተቀመጡ ትምህርቶች ምርጫዎችን ይጀምራል፣ በመሣሪያው የታወሱ መልሶችንም ያስወግዳል። የመለያ መገለጫዎ ይቆያል።",
    confirmSignOutTitle: "ከመለያዎ ይውጡ?",
    confirmSignOutCopy:
      "ወደ ቤተሰብ መተግበሪያ ይመለሳሉ። የመለያ መገለጫዎ ይቆያል።",
    cancel: "ይቅር",
    confirmClear: "የመሣሪያ ውሂብ አጥፋ",
    confirmSignOut: "ውጣ",
    working: "በሂደት ላይ…",
    back: "ተመለስ",
    footerTag: "ትንሽ እውቀት። ብዙ እንክብካቤ።",
  },
} as const;

type ConfirmAction = "clear" | "signOut" | null;

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const authReady = authLoaded && userLoaded;
  const language = useTrinityStore((state) => state.language);
  const setLanguage = useTrinityStore((state) => state.setLanguage);
  const setAuthReturnTo = useTrinityStore((state) => state.setAuthReturnTo);
  const savedIds = useTrinityStore((state) => state.savedIds);
  const clearLocalData = useTrinityStore((state) => state.clearLocalData);
  const accountProfile = useQuery(
    api.onboarding.getProfile,
    authReady && isSignedIn ? {} : "skip",
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState<"cleared" | null>(null);
  const am = language === "am";
  const text = copy[language];
  const displayName =
    user?.fullName || user?.firstName || text.guestName;
  const email = user?.primaryEmailAddress?.emailAddress;
  const initial = displayName.trim().slice(0, 1).toLocaleUpperCase();

  const openConfirm = (action: Exclude<ConfirmAction, null>) => {
    setActionError("");
    setNotice(null);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (actionBusy) return;
    setActionError("");
    setConfirmAction(null);
  };

  const clearDeviceData = async () => {
    setActionBusy(true);
    setActionError("");
    try {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(ONBOARDING_PROFILE_KEY);
      }
      clearLocalData();
      setConfirmAction(null);
      setNotice("cleared");
    } catch {
      setActionError(text.clearFailed);
    } finally {
      setActionBusy(false);
    }
  };

  const confirmSignOut = async () => {
    setActionBusy(true);
    setActionError("");
    try {
      await signOut();
      setAuthReturnTo(null);
      setConfirmAction(null);
      router.replace("/public/home" as Href);
    } catch {
      setActionError(text.signOutError);
    } finally {
      setActionBusy(false);
    }
  };

  const confirmTitle =
    confirmAction === "clear"
      ? text.confirmClearTitle
      : text.confirmSignOutTitle;
  const confirmCopy =
    confirmAction === "clear" ? text.confirmClearCopy : text.confirmSignOutCopy;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/images/trinity-symbol.png")}
            resizeMode="contain"
            style={styles.brandMark}
          />
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>Trinity Health Solution</Text>
            <Text style={styles.brandTag}>{text.brandTag}</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>{text.eyebrow}</Text>
        <Text style={styles.title}>{text.title}</Text>
        <Text style={styles.subtitle}>{text.subtitle}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.account}</Text>
          <View style={styles.accountCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial || "T"}</Text>
            </View>
            <View style={styles.accountCopy}>
              <Text numberOfLines={1} style={styles.accountName}>
                {authReady ? displayName : text.account}
              </Text>
              <Text numberOfLines={2} style={styles.accountDetail}>
                {!authReady
                  ? text.checkingProfile
                  : isSignedIn
                    ? email || text.signedIn
                    : text.guestSubtitle}
              </Text>
              {authReady && isSignedIn ? (
                <View style={styles.statusPill}>
                  <Ionicons name="checkmark-circle" size={14} color="#0E7A33" />
                  <Text style={styles.statusPillText}>{text.signedIn}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {authReady && !isSignedIn ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setAuthReturnTo(AUTHENTICATED_PROFILE_TAB);
                router.push("/sign-in" as Href);
              }}
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="person-circle-outline" size={19} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>{text.signIn}</Text>
              <Ionicons
                name={am ? "arrow-back" : "arrow-forward"}
                size={16}
                color="#FFFFFF"
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeading title={text.healthProfile} />
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="heart-outline" size={19} color="#0E7A33" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{text.profileCardTitle}</Text>
              <Text style={styles.cardSummary}>{text.healthProfileHint}</Text>
              <View style={styles.profileStatus}>
                <Ionicons
                  name={
                    !authReady || (isSignedIn && accountProfile === undefined)
                      ? "time-outline"
                      : isSignedIn && accountProfile
                        ? "checkmark-circle-outline"
                        : "information-circle-outline"
                  }
                  size={17}
                  color="#2F8F4E"
                />
                <Text style={styles.profileStatusText}>
                  {!authReady
                    ? text.checkingProfile
                    : isSignedIn
                      ? accountProfile === undefined
                        ? text.checkingProfile
                        : accountProfile
                          ? text.profileSaved
                          : text.profileEmpty
                      : text.profileGuest}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/onboarding?source=profile" as Href)}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSignedIn && accountProfile ? text.editProfile : text.createProfile}
                </Text>
                <Ionicons
                  name={am ? "arrow-back" : "arrow-forward"}
                  size={15}
                  color="#0A5C26"
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title={text.preferences} />
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="language-outline" size={19} color="#0E7A33" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{text.language}</Text>
              <Text style={styles.cardSummary}>{text.languageHint}</Text>
              <View accessibilityRole="radiogroup" style={styles.languageRow}>
                <LanguageOption
                  label={text.amharic}
                  detail={text.amharicDetail}
                  selected={am}
                  onPress={() => setLanguage("am")}
                />
                <LanguageOption
                  label={text.english}
                  detail={text.englishDetail}
                  selected={!am}
                  onPress={() => setLanguage("en")}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title={text.saved} />
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(
                (isSignedIn ? "/(app)/(tabs)/saved" : "/public/saved") as Href,
              )
            }
            style={({ pressed }) => [styles.savedCard, pressed && styles.pressed]}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="bookmark-outline" size={18} color="#0E7A33" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{text.savedCount(savedIds.length)}</Text>
              <Text style={styles.cardSummary}>{text.savedHint}</Text>
            </View>
            <Ionicons
              name={am ? "chevron-back" : "chevron-forward"}
              size={18}
              color="#4B5C51"
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <SectionHeading title={text.privacy} />
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#0E7A33"
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{text.privacyCardTitle}</Text>
              <Text style={styles.bodyCopy}>{text.privacyCopy}</Text>
              <View style={styles.deviceDataNote}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={17}
                  color="#2F8F4E"
                />
                <View style={styles.deviceDataCopy}>
                  <Text style={styles.deviceDataTitle}>{text.deviceDataLabel}</Text>
                  <Text style={styles.bodyCopy}>{text.privacyDetail}</Text>
                </View>
              </View>
              {notice ? (
                <View style={styles.notice}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={17}
                    color="#0E7A33"
                  />
                  <Text style={styles.noticeText}>{text.cleared}</Text>
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => openConfirm("clear")}
                style={({ pressed }) => [
                  styles.dangerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="trash-outline" size={16} color="#B3261E" />
                <Text style={styles.dangerButtonText}>{text.clearData}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title={text.more} />
          <ActionRow
            icon="chatbubble-ellipses-outline"
            title={text.askOpal}
            subtitle={text.askOpalHint}
            onPress={() =>
              router.push(
                (isSignedIn ? "/(app)/(tabs)/opal" : "/public/opal") as Href,
              )
            }
            am={am}
          />
          <ActionRow
            icon="briefcase-outline"
            title={text.staffPortal}
            subtitle={text.staffPortalHint}
            onPress={() => router.push("/staff-portal" as Href)}
            am={am}
          />
        </View>

        {authReady && isSignedIn ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{text.accountActions}</Text>
            <Text style={styles.sectionHint}>{text.signOutHint}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => openConfirm("signOut")}
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color="#4B5C51" />
              <Text style={styles.signOutText}>{text.signOut}</Text>
              <Ionicons
                name={am ? "arrow-back" : "arrow-forward"}
                size={15}
                color="#738278"
              />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.footer}>
          <Image
            source={require("../assets/images/trinity-symbol.png")}
            resizeMode="contain"
            style={styles.footerMark}
          />
          <Text style={styles.footerName}>Trinity Health Solution</Text>
          <Text style={styles.footerTag}>{text.footerTag}</Text>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>

      <Modal
        transparent
        visible={confirmAction !== null}
        animationType="fade"
        onRequestClose={closeConfirm}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeConfirm}>
          <Pressable style={styles.confirmCard} onPress={() => undefined}>
            <View
              style={[
                styles.confirmIcon,
                confirmAction === "signOut" && styles.signOutConfirmIcon,
              ]}
            >
              <Ionicons
                name={confirmAction === "clear" ? "trash-outline" : "log-out-outline"}
                size={21}
                color={confirmAction === "clear" ? "#B3261E" : "#0A5C26"}
              />
            </View>
            <Text style={styles.confirmTitle}>{confirmTitle}</Text>
            <Text style={styles.confirmCopy}>{confirmCopy}</Text>
            {actionError ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {actionError}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={actionBusy}
              onPress={() =>
                void (confirmAction === "clear"
                  ? clearDeviceData()
                  : confirmSignOut())
              }
              style={({ pressed }) => [
                confirmAction === "clear"
                  ? styles.confirmDangerButton
                  : styles.confirmPrimaryButton,
                pressed && !actionBusy && styles.pressed,
                actionBusy && styles.disabledButton,
              ]}
            >
              {actionBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={
                    confirmAction === "clear"
                      ? styles.confirmDangerText
                      : styles.confirmPrimaryText
                  }
                >
                  {confirmAction === "clear"
                    ? text.confirmClear
                    : text.confirmSignOut}
                </Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={actionBusy}
              onPress={closeConfirm}
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

function SectionHeading({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function LanguageOption({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.languageOption, selected && styles.languageOptionSelected]}
    >
      <View style={styles.languageOptionCopy}>
        <Text
          style={[
            styles.languageOptionText,
            selected && styles.languageOptionTextSelected,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.languageOptionDetail}>{detail}</Text>
      </View>
      {selected ? (
        <Ionicons
          name="checkmark"
          size={17}
          color="#0E7A33"
          style={styles.languageOptionCheck}
        />
      ) : null}
    </Pressable>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  am,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  am: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <View style={styles.cardIcon}>
      <Ionicons name={icon} size={18} color="#0E7A33" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSummary}>{subtitle}</Text>
      </View>
      <Ionicons
        name={am ? "chevron-back" : "chevron-forward"}
        size={18}
        color="#4B5C51"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7FBF7" },
  content: {
    alignSelf: "center",
    maxWidth: 560,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    width: "100%",
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  brandMark: { width: 36, height: 36 },
  brandCopy: { gap: 3 },
  brandName: {
    color: "#0E7A33",
    fontFamily: "Righteous_400Regular",
    fontSize: 14,
  },
  brandTag: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  eyebrow: {
    color: "#0E7A33",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  title: {
    color: "#14221A",
    fontFamily: "Righteous_400Regular",
    fontSize: 28,
    lineHeight: 36,
    marginTop: 5,
  },
  subtitle: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  section: { marginTop: 21 },
  sectionTitle: {
    color: "#14221A",
    fontFamily: "Righteous_400Regular",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 10,
  },
  sectionHint: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: -3,
    marginBottom: 10,
  },
  accountCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 16,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#EAF4E8",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: "#0E7A33",
    fontFamily: "Righteous_400Regular",
    fontSize: 20,
  },
  accountCopy: { flex: 1, gap: 4, minWidth: 0 },
  accountName: {
    color: "#14221A",
    fontFamily: "Righteous_400Regular",
    fontSize: 15,
  },
  accountDetail: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  statusPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF8F0",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusPillText: {
    color: "#0A5C26",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: "#0E7A33",
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 9,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  signInButtonText: {
    color: "#FFFFFF",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  card: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 16,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: "#EAF4E8",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: {
    color: "#14221A",
    fontFamily: "Righteous_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
  cardSummary: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  profileStatus: {
    alignItems: "flex-start",
    backgroundColor: "#F4F9F5",
    borderColor: "#D5E6D3",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 11,
  },
  profileStatusText: {
    color: "#4B5C51",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 13,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: "#0A5C26",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  languageRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  languageOption: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 62,
    paddingHorizontal: 13,
    paddingRight: 32,
    paddingVertical: 11,
  },
  languageOptionSelected: {
    backgroundColor: "#EEF8F0",
    borderColor: "#0E7A33",
  },
  languageOptionCopy: { gap: 2, minWidth: 0 },
  languageOptionCheck: { position: "absolute", right: 11, top: 11 },
  languageOptionText: {
    color: "#14221A",
    fontFamily: "Righteous_400Regular",
    fontSize: 14,
  },
  languageOptionTextSelected: { color: "#0E7A33" },
  languageOptionDetail: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
  },
  savedCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    minHeight: 78,
    padding: 16,
  },
  bodyCopy: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  deviceDataNote: {
    alignItems: "flex-start",
    backgroundColor: "#F4F9F5",
    borderColor: "#D5E6D3",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
    padding: 12,
  },
  deviceDataCopy: { flex: 1, minWidth: 0 },
  deviceDataTitle: {
    color: "#0A5C26",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
  },
  notice: {
    alignItems: "center",
    backgroundColor: "#EEF8F0",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  noticeText: {
    color: "#0A5C26",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#B3261E",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  dangerButtonText: {
    color: "#B3261E",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
  },
  actionRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    marginTop: 9,
    minHeight: 78,
    padding: 14,
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E6D3",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  signOutText: {
    color: "#4B5C51",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
  },
  footer: {
    alignItems: "center",
    borderTopColor: "#D5E6D3",
    borderTopWidth: 1,
    marginTop: 26,
    paddingTop: 20,
  },
  footerMark: { height: 38, width: 44 },
  footerName: {
    color: "#0E7A33",
    fontFamily: "Righteous_400Regular",
    fontSize: 17,
    marginTop: 5,
  },
  footerTag: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  bottomSpace: { height: 16 },
  pressed: { opacity: 0.78 },
  disabledButton: { opacity: 0.55 },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "#15251A80",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  confirmCard: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    maxWidth: 420,
    padding: 22,
    width: "100%",
  },
  confirmIcon: {
    alignItems: "center",
    backgroundColor: "#FCEFED",
    borderRadius: 13,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  signOutConfirmIcon: { backgroundColor: "#EAF4E8" },
  confirmTitle: {
    color: "#14221A",
    fontFamily: "Righteous_400Regular",
    fontSize: 19,
    lineHeight: 26,
    marginTop: 14,
  },
  confirmCopy: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  errorText: {
    color: "#B3261E",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  confirmDangerButton: {
    alignItems: "center",
    backgroundColor: "#B3261E",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
  },
  confirmDangerText: {
    color: "#FFFFFF",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
  },
  confirmPrimaryButton: {
    alignItems: "center",
    backgroundColor: "#0E7A33",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
  },
  confirmPrimaryText: {
    color: "#FFFFFF",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
  },
  cancelButton: { alignItems: "center", marginTop: 5, padding: 13 },
  cancelButtonText: {
    color: "#4B5C51",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
  },
});
