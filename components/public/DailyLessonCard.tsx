import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DailyLessonCardProps = {
  copy: { todaysLesson: string; lessonNumber: string; foodSafety: string; lessonTitle: string; lessonSummary: string; learnTogether: string; minutes: string };
  onPress: () => void;
};

export function DailyLessonCard({ copy, onPress }: DailyLessonCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}><Text style={styles.kicker}>{copy.todaysLesson}</Text><Text style={styles.number}>{copy.lessonNumber}</Text></View>
      <View style={styles.categoryRow}><View style={styles.categoryDot}><Ionicons name="leaf-outline" size={13} color="#3B8D55" /></View><Text style={styles.category}>{copy.foodSafety}</Text></View>
      <View style={styles.bodyRow}>
        <View style={styles.copy}><Text style={styles.title}>{copy.lessonTitle}</Text><Text style={styles.summary}>{copy.lessonSummary}</Text></View>
        <View style={styles.illustration}><Ionicons name="restaurant-outline" size={29} color="#3B8D55" /><View style={styles.illustrationLeaf}><Ionicons name="leaf" size={15} color="#8AC05A" /></View></View>
      </View>
      <View style={styles.actionRow}>
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}><Text style={styles.actionText}>{copy.learnTogether}</Text><Ionicons name="arrow-forward" size={15} color="#FFFFFF" /></Pressable>
        <View style={styles.duration}><Ionicons name="time-outline" size={13} color="#7C887E" /><Text style={styles.durationText}>{copy.minutes}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderColor: "#DFE8E0", borderRadius: 18, borderWidth: 1, marginBottom: 15, overflow: "hidden", padding: 14 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  kicker: { color: "#397A4D", fontFamily: "Righteous_400Regular", fontSize: 8, letterSpacing: 1 },
  number: { color: "#4D8D5A", fontFamily: "Righteous_400Regular", fontSize: 8 },
  categoryRow: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 12 },
  categoryDot: { alignItems: "center", backgroundColor: "#EAF4EB", borderRadius: 8, height: 22, justifyContent: "center", width: 22 },
  category: { color: "#3D7950", fontFamily: "Righteous_400Regular", fontSize: 8 },
  bodyRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 5 },
  copy: { flex: 1 },
  title: { color: "#25372A", fontFamily: "Righteous_400Regular", fontSize: 16, lineHeight: 20 },
  summary: { color: "#6E7B72", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 13, marginTop: 7 },
  illustration: { alignItems: "center", backgroundColor: "#EAF4EB", borderRadius: 28, height: 70, justifyContent: "center", width: 70 },
  illustrationLeaf: { position: "absolute", right: 8, top: 7 },
  actionRow: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 11 },
  action: { alignItems: "center", backgroundColor: "#14823F", borderRadius: 9, flexDirection: "row", gap: 6, minHeight: 31, paddingHorizontal: 10 },
  actionPressed: { opacity: 0.82 },
  actionText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 9 },
  duration: { alignItems: "center", flexDirection: "row", gap: 4 },
  durationText: { color: "#78847A", fontFamily: "Righteous_400Regular", fontSize: 8 },
});
