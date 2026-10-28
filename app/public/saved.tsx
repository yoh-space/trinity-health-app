import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { anyApi } from "convex/server";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getEducationContent,
  type EducationItem,
} from "../../components/public/educationContent";
import { useTrinityStore } from "../../store/useTrinityStore";

export default function SavedLessonsScreen() {
  const router = useRouter();
  const language = useTrinityStore((state) => state.language);
  const savedIds = useTrinityStore((state) => state.savedIds);
  const am = language === "am";
  const published = useQuery(anyApi.education.listPublished) as
    | EducationItem[]
    | undefined;
  const content = getEducationContent(published);
  const savedItems = content.filter((item) => savedIds.includes(item._id));

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={am ? "ተመለስ" : "Go back"}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={18} color="#345B40" />
        </Pressable>
        <Text style={styles.eyebrow}>TRINITY</Text>
        <Text style={styles.title}>
          {am ? "የተቀመጡ ትምህርቶች" : "Saved lessons"}
        </Text>
        <Text style={styles.subtitle}>
          {am ? "ለሌላ ጊዜ ያስቀመጧቸው ትምህርቶች።" : "Lessons you saved to revisit."}
        </Text>

        {savedItems.length ? (
          savedItems.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item._id}
              onPress={() =>
                router.push(
                  `/public/article/${encodeURIComponent(item._id)}` as Href,
                )
              }
              style={styles.card}
            >
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.cardTitle}>
                {am ? item.titleAm : item.title}
              </Text>
              <Text style={styles.summary}>
                {am ? item.summaryAm : item.summary}
              </Text>
              <Text style={styles.readTime}>
                {am
                  ? `${item.readMinutes} ደቂቃ ንባብ`
                  : `${item.readMinutes} min read`}
              </Text>
            </Pressable>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={25} color="#65906E" />
            <Text style={styles.emptyTitle}>
              {am ? "ገና ምንም አልተቀመጠም" : "Nothing saved yet"}
            </Text>
            <Text style={styles.emptyCopy}>
              {am
                ? "በትምህርት ገጹ ላይ የማስቀመጫ ምልክቱን ይጫኑ።"
                : "Use the bookmark on a lesson to save it here."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 },
  content: { padding: 18, paddingBottom: 24 },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E1",
    borderRadius: 13,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    marginBottom: 20,
    width: 36,
  },
  eyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1,
  },
  title: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 24, marginTop: 7 },
  subtitle: {
    color: "#6D7B70",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2EAE3",
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 13,
    padding: 14,
  },
  category: {
    color: "#41804E",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 0.6,
  },
  cardTitle: {
    color: "#2D4132",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  summary: {
    color: "#68776C",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  readTime: {
    color: "#89968C",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    marginTop: 8,
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 22,
    padding: 22,
  },
  emptyTitle: {
    color: "#314938",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    marginTop: 9,
  },
  emptyCopy: {
    color: "#738176",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
    textAlign: "center",
  },
});
