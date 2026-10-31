import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function StaffAccessState({
  loading,
  icon = "shield-outline",
  title,
  body,
  actionLabel,
  onAction,
}: {
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.accessState}>
        {loading ? (
          <ActivityIndicator color="#247640" />
        ) : (
          <Ionicons name={icon} size={27} color="#4D7A59" />
        )}
        <Text style={styles.accessTitle}>{title}</Text>
        {!!body && <Text style={styles.accessBody}>{body}</Text>}
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={styles.accessButton}>
            <Text style={styles.accessButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export function StaffMetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={16} color="#4D8B5A" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function StaffQueueFilterButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.filterButton, selected && styles.filterButtonSelected]}
    >
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StaffActionButton({
  label,
  icon,
  onPress,
  disabled,
  secondary,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary && styles.secondaryAction,
        disabled && styles.actionDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={secondary ? "#4E7057" : "#FFFFFF"}
      />
      <Text style={[styles.actionText, secondary && styles.secondaryActionText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F5F8F5", flex: 1 },
  accessState: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  accessTitle: { color: "#244B30", fontFamily: "Righteous_400Regular", fontSize: 17, marginTop: 11, textAlign: "center" },
  accessBody: { color: "#6C7D70", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 16, marginTop: 8, textAlign: "center" },
  accessButton: { alignItems: "center", backgroundColor: "#267642", borderRadius: 11, marginTop: 18, minHeight: 42, justifyContent: "center", paddingHorizontal: 17 },
  accessButtonText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 10 },
  metricCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 13, borderWidth: 1, flex: 1, minHeight: 78, padding: 9 },
  metricValue: { color: "#245D37", fontFamily: "Righteous_400Regular", fontSize: 20, marginTop: 5 },
  metricLabel: { color: "#738177", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 2 },
  filterButton: { alignItems: "center", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 35, paddingHorizontal: 5 },
  filterButtonSelected: { backgroundColor: "#FFFFFF" },
  filterText: { color: "#728176", fontFamily: "Righteous_400Regular", fontSize: 9 },
  filterTextSelected: { color: "#276B3A" },
  actionButton: { alignItems: "center", backgroundColor: "#267642", borderRadius: 10, flexDirection: "row", gap: 6, justifyContent: "center", minHeight: 37, paddingHorizontal: 10 },
  secondaryAction: { backgroundColor: "#F3F8F3", borderColor: "#D4E3D6", borderWidth: 1 },
  actionDisabled: { opacity: 0.5 },
  actionText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 8 },
  secondaryActionText: { color: "#4E7057" },
});
