import { StyleSheet, Text, TextInput, View } from "react-native";

type OnboardingTextFieldProps = {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
};

export function OnboardingTextField({
  label,
  hint,
  placeholder,
  value,
  onChangeText,
  multiline = false,
}: OnboardingTextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}. ${hint}`}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A297"
        returnKeyType={multiline ? "default" : "done"}
        style={[styles.input, multiline && styles.multiline]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 13 },
  label: { color: "#304334", fontFamily: "Righteous_400Regular", fontSize: 11 },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE8DF",
    borderRadius: 12,
    borderWidth: 1,
    color: "#263A2D",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    marginTop: 7,
    minHeight: 43,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  multiline: { minHeight: 54, paddingTop: 11 },
  hint: {
    color: "#879489",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
  },
});
