import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

type GuestChoiceChipProps = { label: string; selected: boolean; onPress: () => void; role?: "checkbox" | "radio"; compact?: boolean };

export function GuestChoiceChip({ label, selected, onPress, role = "checkbox", compact = false }: GuestChoiceChipProps) {
  return (
    <Pressable accessibilityRole={role} accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.chip, compact && styles.compactChip, selected && styles.selectedChip]}>
      <Ionicons name={selected ? "checkmark-circle" : "add-circle-outline"} size={compact ? 13 : 17} color={selected ? "#25804A" : "#9AAA9D"} />
      <Text numberOfLines={compact ? 2 : undefined} style={[styles.label, compact && styles.compactLabel, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DCE7DD", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 6, minHeight: 44, paddingHorizontal: 14, paddingVertical: 10 },
  compactChip: { borderRadius: 10, flexBasis: "30%", flexGrow: 1, minHeight: 40, paddingHorizontal: 7, paddingVertical: 6 },
  selectedChip: { backgroundColor: "#EAF4EB", borderColor: "#238047" },
  label: { color: "#526357", fontFamily: "Righteous_400Regular", fontSize: 13, lineHeight: 18 },
  compactLabel: { fontSize: 11, lineHeight: 14, flexShrink: 1 },
  selectedLabel: { color: "#206B3B", fontFamily: "Righteous_400Regular" },
});
