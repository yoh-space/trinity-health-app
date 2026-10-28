import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DailyLessonCard } from "../components/public/DailyLessonCard";
import { GuestHomeHeader } from "../components/public/GuestHomeHeader";
import { HomeLessonCard } from "../components/public/HomeLessonCard";
import { HomeQuickLink } from "../components/public/HomeQuickLink";
import { homeCopy } from "../components/public/homeContent";
import { useTrinityStore } from "../store/useTrinityStore";

export default function TrinityHomeScreen() {
  const router = useRouter();
  const { language, setLanguage, savedIds, toggleSaved } = useTrinityStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const copy = homeCopy[language];
  const am = language === "am";

  const openArticle = (id: string) => router.push(`/public/article/${encodeURIComponent(id)}` as Href);
  const showLanguageSettings = () => setSettingsVisible(true);
  const showSavedLessons = () => router.push("/public/saved" as Href);
  const openOpal = () => router.push("/public/opal" as Href);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GuestHomeHeader language={language} onHomePress={() => router.replace("/public/home" as Href)} onSavedPress={showSavedLessons} onSettingsPress={showLanguageSettings} />
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.welcome}>{copy.welcome}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
        <DailyLessonCard copy={copy} onPress={() => openArticle("food-safety")} />
        <View style={styles.quickLinks}>
          <HomeQuickLink icon="restaurant-outline" image={require("../assets/images/kitchen-meal.jpg")} title={copy.recipeAction} subtitle={copy.recipeSub} onPress={() => router.push("/public/food" as Href)} />
          <HomeQuickLink icon="bookmark-outline" title={copy.notesAction} subtitle={copy.notesSub} onPress={showSavedLessons} />
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{copy.growTitle}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/public/learn" as Href)} style={styles.seeAll}><Text style={styles.seeAllText}>{copy.seeAll}</Text><Ionicons name={am ? "arrow-back" : "arrow-forward"} size={13} color="#438451" /></Pressable>
        </View>
        <HomeLessonCard category={copy.pregnancy} title={copy.pregnancyTitle} minutes={copy.readTime(4)} image={require("../assets/images/pregnancy-plate.jpg")} saved={savedIds.includes("pregnancy")} onToggleSaved={() => toggleSaved("pregnancy")} onPress={() => openArticle("pregnancy")} />
        <HomeLessonCard category={copy.childNutrition} title={copy.childNutritionTitle} minutes={copy.readTime(3)} image={require("../assets/images/child-feeding.jpg")} saved={savedIds.includes("child-nutrition")} onToggleSaved={() => toggleSaved("child-nutrition")} onPress={() => openArticle("child-nutrition")} />
        <Pressable accessibilityRole="button" onPress={openOpal} style={({ pressed }) => [styles.opalCard, pressed && styles.opalPressed]}>
          <View style={styles.opalIcon}><Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" /></View>
          <View style={styles.opalCopy}><Text style={styles.opalTitle}>{copy.askOpal}</Text><Text style={styles.opalSubtitle}>{copy.askOpalSub}</Text></View>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </Pressable>
        <View style={styles.footer}><Ionicons name="leaf-outline" size={15} color="#6B9272" /><Text style={styles.footerText}>{copy.footer}</Text></View>
      </ScrollView>
      <Modal animationType="fade" transparent visible={settingsVisible} onRequestClose={() => setSettingsVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsVisible(false)}>
          <Pressable style={styles.languageModal} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{copy.settingsTitle}</Text>
            <Pressable style={[styles.languageOption, language === "en" && styles.languageOptionActive]} onPress={() => { setLanguage("en"); setSettingsVisible(false); }}><Text style={styles.languageOptionText}>English</Text><Text style={styles.languageOptionSub}>A little learning. A lot of care.</Text></Pressable>
            <Pressable style={[styles.languageOption, language === "am" && styles.languageOptionActive]} onPress={() => { setLanguage("am"); setSettingsVisible(false); }}><Text style={styles.languageOptionText}>አማርኛ</Text><Text style={styles.languageOptionSub}>ትንሽ እውቀት፣ ብዙ እንክብካቤ</Text></Pressable>
            <Pressable onPress={() => setSettingsVisible(false)} style={styles.cancelButton}><Text style={styles.cancelText}>{copy.cancel}</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 }, content: { paddingBottom: 28, paddingHorizontal: 16, paddingTop: 6 }, intro: { marginBottom: 15 }, eyebrow: { color: "#54805E", fontFamily: "Righteous_400Regular", fontSize: 8, letterSpacing: 1 }, welcome: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 22, lineHeight: 28, marginTop: 7 }, subtitle: { color: "#6D7B70", fontFamily: "Righteous_400Regular", fontSize: 11, marginTop: 4 }, quickLinks: { flexDirection: "row", gap: 9, marginBottom: 23 }, sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11 }, sectionTitle: { color: "#233D2B", fontFamily: "Righteous_400Regular", fontSize: 16 }, seeAll: { alignItems: "center", flexDirection: "row", gap: 4 }, seeAllText: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 9 }, opalCard: { alignItems: "center", backgroundColor: "#315F3E", borderRadius: 16, flexDirection: "row", gap: 10, marginTop: 8, padding: 13 }, opalPressed: { opacity: 0.85 }, opalIcon: { alignItems: "center", backgroundColor: "#FFFFFF26", borderRadius: 12, height: 38, justifyContent: "center", width: 38 }, opalCopy: { flex: 1, gap: 4 }, opalTitle: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 10 }, opalSubtitle: { color: "#DBE9DD", fontFamily: "Righteous_400Regular", fontSize: 8 }, footer: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 18 }, footerText: { color: "#829086", fontFamily: "Righteous_400Regular", fontSize: 8 }, modalBackdrop: { alignItems: "center", backgroundColor: "#15251A66", flex: 1, justifyContent: "flex-end", padding: 16 }, languageModal: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, width: "100%" }, modalTitle: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 18, marginBottom: 10 }, languageOption: { borderColor: "#E2EAE3", borderRadius: 14, borderWidth: 1, marginTop: 8, padding: 12 }, languageOptionActive: { backgroundColor: "#EEF7EF", borderColor: "#78A981" }, languageOptionText: { color: "#2D4934", fontFamily: "Righteous_400Regular", fontSize: 12 }, languageOptionSub: { color: "#718075", fontFamily: "Righteous_400Regular", fontSize: 9, marginTop: 3 }, cancelButton: { alignItems: "center", padding: 12 }, cancelText: { color: "#4A7955", fontFamily: "Righteous_400Regular", fontSize: 11 },
});
