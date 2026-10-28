import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUser } from "@clerk/expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrinityStore } from "../../../store/useTrinityStore";

export default function ProfileScreen() {
  const { user } = useUser();
  const { language, setLanguage, savedIds } = useTrinityStore();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>TRINITY</Text>
        <Text style={styles.title}>Your learning space</Text>
        <Text style={styles.body}>{user?.firstName ? `Welcome, ${user.firstName}.` : "Welcome to Trinity."}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Language</Text>
          <View style={styles.row}>
            <Pressable onPress={() => setLanguage("am")} style={[styles.option, language === "am" && styles.optionActive]}><Text style={[styles.optionText, language === "am" && styles.optionTextActive]}>አማርኛ</Text></Pressable>
            <Pressable onPress={() => setLanguage("en")} style={[styles.option, language === "en" && styles.optionActive]}><Text style={[styles.optionText, language === "en" && styles.optionTextActive]}>English</Text></Pressable>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved learning</Text>
          <Text style={styles.body}>{savedIds.length} item{savedIds.length === 1 ? "" : "s"} saved for later.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1, backgroundColor: "#F7FAF6", padding: 24 },
  eyebrow: { color: "#087A3D", fontSize: 12, fontFamily: "Righteous_400Regular", letterSpacing: 1.8 },
  title: { color: "#183A25", fontSize: 32, fontFamily: "Righteous_400Regular", marginTop: 12 },
  body: { color: "#5B6B60", fontSize: 15, fontFamily: "Righteous_400Regular", lineHeight: 22, marginTop: 8 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, marginTop: 22, padding: 18 },
  cardTitle: { color: "#183A25", fontSize: 16, fontFamily: "Righteous_400Regular" },
  row: { flexDirection: "row", gap: 10, marginTop: 13 },
  option: { borderColor: "#CBDBCD", borderRadius: 18, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10 },
  optionActive: { backgroundColor: "#087A3D", borderColor: "#087A3D" },
  optionText: { color: "#47604D", fontFamily: "Righteous_400Regular" },
  optionTextActive: { color: "#FFFFFF" },
});
