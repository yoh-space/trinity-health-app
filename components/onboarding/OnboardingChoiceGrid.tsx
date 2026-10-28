import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import type { WelcomeLanguage } from "../welcome/welcomeCopy";
import type { LocalizedOption } from "./onboardingContent";

type OnboardingChoiceGridProps = {
  options: LocalizedOption[];
  language: WelcomeLanguage;
  selected: string | string[];
  onSelect: (id: string) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3;
};

export function OnboardingChoiceGrid({
  options,
  language,
  selected,
  onSelect,
  multiple = false,
  columns = 2,
}: OnboardingChoiceGridProps) {
  const selectedIds = Array.isArray(selected) ? selected : [selected];
  const itemStyle: ViewStyle =
    columns === 1
      ? styles.oneColumn
      : columns === 3
        ? styles.threeColumns
        : styles.twoColumns;

  return (
    <View
      accessibilityRole={multiple ? "none" : "radiogroup"}
      style={styles.grid}
    >
      {options.map((option) => {
        const checked = selectedIds.includes(option.id);
        const label = language === "am" ? option.am : option.en;
        const detail = language === "am" ? option.detailAm : option.detailEn;
        return (
          <Pressable
            key={option.id}
            accessibilityRole={multiple ? "checkbox" : "radio"}
            accessibilityLabel={[label, detail].filter(Boolean).join(" ")}
            accessibilityState={{ checked }}
            onPress={() => onSelect(option.id)}
            style={[styles.option, itemStyle, checked && styles.selectedOption]}
          >
            <View
              style={[
                styles.indicator,
                multiple ? styles.checkbox : styles.radio,
                checked && styles.checkedIndicator,
                checked && !multiple && styles.checkedRadio,
              ]}
            >
              {checked && (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color="#FFFFFF"
                  accessibilityElementsHidden
                />
              )}
            </View>
            <View style={styles.optionCopy}>
              <Text style={[styles.optionText, checked && styles.selectedText]}>
                {label}
              </Text>
              {detail && <Text style={styles.detailText}>{detail}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  oneColumn: { width: "100%" },
  twoColumns: { width: "48.5%" },
  threeColumns: { width: "31.5%" },
  option: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE9E0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 45,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectedOption: {
    backgroundColor: "#EEF7F0",
    borderColor: "#29804A",
    borderWidth: 1.5,
  },
  indicator: {
    alignItems: "center",
    borderColor: "#AFC5B1",
    borderWidth: 1,
    flexShrink: 0,
    height: 17,
    justifyContent: "center",
    width: 17,
  },
  checkbox: { borderRadius: 4 },
  radio: { borderRadius: 9 },
  checkedIndicator: { backgroundColor: "#238148", borderColor: "#238148" },
  checkedRadio: { borderRadius: 9 },
  optionCopy: { flex: 1, gap: 2 },
  optionText: {
    color: "#293B2E",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
  selectedText: { color: "#246B3D" },
  detailText: {
    color: "#78877C",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 12,
  },
});
