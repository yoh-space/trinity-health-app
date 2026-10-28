import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { anyApi } from "convex/server";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getEducationContent,
  type EducationItem,
} from "../components/public/educationContent";
import { useTrinityStore } from "../store/useTrinityStore";

const topics = [
  { key: "all", en: "All", am: "ሁሉም" },
  { key: "pregnancy", en: "Pregnancy", am: "እርግዝና" },
  { key: "breastfeeding", en: "Breastfeeding", am: "ጡት ማጥባት" },
  { key: "child-nutrition", en: "Child nutrition", am: "የህፃናት አመጋገብ" },
  { key: "food-safety", en: "Food safety", am: "የምግብ ደህንነት" },
  { key: "safe-water", en: "Clean water & hygiene", am: "ንጹህ ውሃ እና ንጽህና" },
];

export default function LearningScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const published = useQuery(anyApi.education.listPublished) as
    | EducationItem[]
    | undefined;
  const content: EducationItem[] = getEducationContent(published);
  const language = useTrinityStore((state) => state.language);
  const savedIds = useTrinityStore((state) => state.savedIds);
  const toggleSaved = useTrinityStore((state) => state.toggleSaved);
  const am = language === "am";
  const filteredContent = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return content.filter((item) => {
      const matchesTopic =
        activeTopic === "all" ||
        (item.categoryKey ??
          item.category.toLowerCase().replaceAll(" ", "-")) === activeTopic;
      const searchable = [
        item.title,
        item.titleAm,
        item.summary,
        item.summaryAm,
        item.category,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return matchesTopic && (!query || searchable.includes(query));
    });
  }, [activeTopic, content, search]);

  const openArticle = (id: string) =>
    router.push(`/public/article/${encodeURIComponent(id)}` as Href);
  const openOpal = () => router.push("/public/opal" as Href);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>TRINITY</Text>
            <Text style={styles.greeting}>
              {am ? "ለቤተሰብዎ የጤና ትምህርት" : "Health learning for your family"}
            </Text>
          </View>
          <View style={styles.languageBadge}>
            <Text style={styles.languageText}>{am ? "አማ" : "EN"}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroKicker}>
            {am ? "ዛሬ ትንሽ ይማሩ" : "LEARN A LITTLE TODAY"}
          </Text>
          <Text style={styles.heroTitle}>
            {am
              ? "ቀላል መረጃ፣ ጤናማ ምርጫዎች"
              : "Clear information. Confident choices."}
          </Text>
          <Text style={styles.heroBody}>
            {am
              ? "በቤትዎ ውስጥ የሚሰሩ ትንሽ እርምጃዎችን ያግኙ።"
              : "Discover small, practical actions that fit your home."}
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color="#738278" />
          <TextInput
            accessibilityLabel={am ? "ትምህርት ፈልግ" : "Search lessons"}
            onChangeText={setSearch}
            placeholder={am ? "ትምህርት ፈልግ..." : "Search lessons..."}
            placeholderTextColor="#87938A"
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={am ? "ፍለጋን አጽዳ" : "Clear search"}
              hitSlop={8}
              onPress={() => setSearch("")}
            >
              <Ionicons name="close-circle" size={18} color="#89958C" />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.topicList}
          showsHorizontalScrollIndicator={false}
        >
          {topics.map((topic) => {
            const active = activeTopic === topic.key;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={topic.key}
                onPress={() => setActiveTopic(topic.key)}
                style={[styles.topicChip, active && styles.topicChipActive]}
              >
                <Text
                  style={[styles.topicText, active && styles.topicTextActive]}
                >
                  {am ? topic.am : topic.en}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {am ? "ለእርስዎ የተመረጠ" : "Picked for you"}
          </Text>
          <Text style={styles.sectionMeta}>
            {filteredContent.length} {am ? "ትምህርቶች" : "lessons"}
          </Text>
        </View>

        {filteredContent.length ? (
          filteredContent.map((item, index) => {
            const saved = savedIds.includes(item._id);
            return (
              <Pressable
                accessibilityRole="button"
                key={item._id}
                onPress={() => openArticle(item._id)}
                style={[styles.card, index === 0 && styles.featuredCard]}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.category}>
                    {item.category.toUpperCase()}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      saved
                        ? am
                          ? "ከተቀመጡ አስወግድ"
                          : "Remove saved lesson"
                        : am
                          ? "ትምህርት አስቀምጥ"
                          : "Save lesson"
                    }
                    hitSlop={8}
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleSaved(item._id);
                    }}
                  >
                    <Ionicons
                      color={saved ? "#087A3D" : "#6C7D70"}
                      name={saved ? "bookmark" : "bookmark-outline"}
                      size={21}
                    />
                  </Pressable>
                </View>
                <Text style={styles.cardTitle}>
                  {am ? item.titleAm : item.title}
                </Text>
                <Text numberOfLines={2} style={styles.cardBody}>
                  {am ? item.summaryAm : item.summary}
                </Text>
                <Text style={styles.readTime}>
                  {item.readMinutes} {am ? "ደቂቃ ንባብ" : "min read"}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={24} color="#65906E" />
            <Text style={styles.emptyTitle}>
              {am ? "ትምህርት አልተገኘም" : "No lessons found"}
            </Text>
            <Text style={styles.emptyCopy}>
              {am
                ? "ሌላ ቃል ይሞክሩ ወይም ሌላ ርዕስ ይምረጡ።"
                : "Try another search or choose a different topic."}
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={openOpal}
          style={styles.opalCard}
        >
          <View style={styles.opalIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.opalCopy}>
            <Text style={styles.opalTitle}>
              {am ? "ኦፓልን ይጠይቁ" : "Ask Opal"}
            </Text>
            <Text style={styles.opalSubtitle}>
              {am
                ? "ከትምህርት ማስታወሻዎች የተዘጋጁ መልሶችን ያግኙ።"
                : "Get prepared answers from learning notes."}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.safeNote}>
          {am
            ? "ትሪኒቲ የጤና ትምህርት ብቻ ይሰጣል።"
            : "Trinity provides health learning, not clinical care."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF6", flex: 1 },
  content: { padding: 18, paddingBottom: 100 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  brand: {
    color: "#087A3D",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    letterSpacing: 2.3,
  },
  greeting: {
    color: "#183A25",
    fontFamily: "Righteous_400Regular",
    fontSize: 20,
    marginTop: 5,
  },
  languageBadge: {
    alignItems: "center",
    backgroundColor: "#DDEEE0",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 44,
  },
  languageText: { color: "#087A3D", fontFamily: "Righteous_400Regular", fontSize: 12 },
  hero: {
    backgroundColor: "#087A3D",
    borderRadius: 24,
    marginTop: 22,
    padding: 21,
  },
  heroKicker: {
    color: "#BBE5BE",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "Righteous_400Regular",
    fontSize: 27,
    lineHeight: 34,
    marginTop: 11,
  },
  heroBody: {
    color: "#D8EFDA",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 18,
    paddingHorizontal: 13,
    height: 48,
  },
  searchInput: {
    color: "#24392A",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    height: "100%",
  },
  topicList: { gap: 8, paddingVertical: 14 },
  topicChip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1EAE2",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  topicChipActive: { backgroundColor: "#087A3D", borderColor: "#087A3D" },
  topicText: { color: "#59695E", fontFamily: "Righteous_400Regular", fontSize: 11 },
  topicTextActive: { color: "#FFFFFF", fontFamily: "Righteous_400Regular" },
  sectionHeader: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 11,
  },
  sectionTitle: { color: "#183A25", fontFamily: "Righteous_400Regular", fontSize: 18 },
  sectionMeta: { color: "#738278", fontFamily: "Righteous_400Regular", fontSize: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1EAE2",
    borderRadius: 19,
    borderWidth: 1,
    marginBottom: 11,
    padding: 16,
  },
  featuredCard: { borderColor: "#B9DBBF", borderWidth: 1.5 },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: {
    color: "#087A3D",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 0.9,
  },
  cardTitle: {
    color: "#183A25",
    fontFamily: "Righteous_400Regular",
    fontSize: 17,
    lineHeight: 23,
    marginTop: 10,
  },
  cardBody: {
    color: "#627267",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  readTime: {
    color: "#809084",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    marginTop: 12,
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1EAE2",
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    color: "#314938",
    fontFamily: "Righteous_400Regular",
    fontSize: 14,
    marginTop: 9,
  },
  emptyCopy: {
    color: "#738176",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    textAlign: "center",
  },
  opalCard: {
    alignItems: "center",
    backgroundColor: "#315F3E",
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    marginTop: 7,
    padding: 13,
  },
  opalIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF26",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  opalCopy: { flex: 1, gap: 4 },
  opalTitle: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 12 },
  opalSubtitle: { color: "#DBE9DD", fontFamily: "Righteous_400Regular", fontSize: 10 },
  safeNote: {
    color: "#728177",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 16,
    textAlign: "center",
  },
});
