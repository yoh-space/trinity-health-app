import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type HomeQuickLinkProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: number;
  onPress: () => void;
};

export function HomeQuickLink({ title, subtitle, icon, image, onPress }: HomeQuickLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {image ? <Image source={image} style={styles.image} /> : <View style={styles.iconWrap}><Ionicons name={icon} size={20} color="#287544" /></View>}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={14} color="#77877A" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderColor: "#E4EBE4", borderRadius: 15, borderWidth: 1, flex: 1, minHeight: 126, overflow: "hidden", paddingBottom: 10 },
  pressed: { opacity: 0.82 },
  image: { height: 58, marginBottom: 8, width: "100%" },
  iconWrap: { alignItems: "center", backgroundColor: "#EAF4EB", borderRadius: 11, height: 38, justifyContent: "center", margin: 10, width: 38 },
  copy: { flex: 1, paddingHorizontal: 10 },
  title: { color: "#294433", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 14 },
  subtitle: { color: "#7A887D", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 11, marginTop: 4 },
});
