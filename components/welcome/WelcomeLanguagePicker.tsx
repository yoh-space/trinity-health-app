import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WelcomeLanguage } from "./welcomeCopy";

const languages: Array<{
  code: WelcomeLanguage;
  label: string;
  translation: string;
}> = [
  { code: "am", label: "አማርኛ", translation: "Amharic" },
  { code: "en", label: "English", translation: "እንግሊዝኛ" },
];

type WelcomeLanguagePickerProps = {
  language: WelcomeLanguage;
  onSelect: (language: WelcomeLanguage) => void;
};

export function WelcomeLanguagePicker({
  language,
  onSelect,
}: WelcomeLanguagePickerProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Choose your language" style={styles.options}>
      {languages.map((option) => {
        const selected = language === option.code;
        return (
          <Pressable
            key={option.code}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onSelect(option.code)}
            style={[styles.option, selected && styles.selectedOption]}
          >
            <View style={styles.label}>
              <Text style={[styles.languageName, selected && styles.selectedText]}>
                {option.label}
              </Text>
              <Text style={styles.translation}>{option.translation}</Text>
            </View>
            {selected && (
              <Ionicons
                color="#267842"
                name="checkmark"
                size={19}
                accessibilityElementsHidden
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: "row", gap: 10, marginTop: 12 },
  option: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E3D9",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 70,
    paddingHorizontal: 13,
  },
  selectedOption: {
    backgroundColor: "#EEF7F0",
    borderColor: "#27804B",
    borderWidth: 1.5,
  },
  label: { flexShrink: 1 },
  languageName: {
    color: "#203127",
    fontFamily: "Righteous_400Regular",
    fontSize: 16,
  },
  selectedText: { color: "#1F7540" },
  translation: {
    color: "#65756A",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    marginTop: 3,
  },
});
