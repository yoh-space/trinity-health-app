import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type GuestHomeHeaderProps = {
  language: "am" | "en";
  onHomePress: () => void;
  onSavedPress: () => void;
  onSettingsPress: () => void;
};

export function GuestHomeHeader({ language, onHomePress, onSavedPress, onSettingsPress }: GuestHomeHeaderProps) {
  const am = language === "am";
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={am ? "ትሪኒቲ ሄልዝ ሶሉሽን መነሻ" : "Trinity Health Solution home"} onPress={onHomePress} style={styles.brand}>
        <Image source={require("../../assets/images/trinity-symbol.png")} resizeMode="contain" style={styles.symbol} />
        <View style={styles.brandCopy}>
          <Text style={styles.brandName}>Trinity Health Solution</Text>
          <Text style={styles.tagline}>{am ? "ትንሽ እውቀት፣ ብዙ እንክብካቤ" : "A little learning. A lot of care."}</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={am ? "የተቀመጡ ትምህርቶች" : "Saved lessons"} onPress={onSavedPress} style={styles.iconButton}>
          <Ionicons name="bookmark-outline" size={19} color="#365B41" />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={am ? "ቅንብሮች" : "Settings"} onPress={onSettingsPress} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={19} color="#365B41" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 21 },
  brand: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8 },
  symbol: { height: 34, width: 34 },
  brandCopy: { flex: 1, gap: 3 },
  brandName: { color: "#23472E", fontFamily: "Righteous_400Regular", fontSize: 12 },
  tagline: { color: "#77867A", fontFamily: "Righteous_400Regular", fontSize: 9 },
  actions: { flexDirection: "row", gap: 8 },
  iconButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2EAE3", borderRadius: 13, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
});
