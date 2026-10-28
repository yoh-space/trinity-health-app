import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type HomeLessonCardProps = { category: string; title: string; minutes: string; image: number; saved: boolean; onPress: () => void; onToggleSaved: () => void };

export function HomeLessonCard({ category, title, minutes, image, saved, onPress, onToggleSaved }: HomeLessonCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={image} style={styles.image} />
      <View style={styles.copy}><Text style={styles.category}>{category}</Text><Text style={styles.title}>{title}</Text><Text style={styles.time}>{minutes}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={saved ? "Remove saved lesson" : "Save lesson"} hitSlop={8} onPress={onToggleSaved} style={styles.save}><Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={15} color="#62916C" /></Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderColor: "#E3EBE4", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, marginBottom: 9, minHeight: 84, overflow: "hidden", padding: 8, position: "relative" },
  pressed: { opacity: 0.82 },
  image: { borderRadius: 10, height: 68, width: 68 },
  copy: { flex: 1, gap: 3, paddingRight: 22 },
  category: { color: "#39804E", fontFamily: "Righteous_400Regular", fontSize: 8, letterSpacing: 0.4 },
  title: { color: "#2D4132", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 14 },
  time: { color: "#849187", fontFamily: "Righteous_400Regular", fontSize: 8 },
  save: { alignItems: "center", height: 25, justifyContent: "center", position: "absolute", right: 7, top: 5, width: 25 },
});
