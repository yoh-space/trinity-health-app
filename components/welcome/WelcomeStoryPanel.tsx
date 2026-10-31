import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { PatternDivider } from "./PatternDivider";
import { storyCopy } from "./welcomeCopy";
import { useStaffPortalVisibility } from "../../hooks/useStaffPortalVisibility";

const commitmentIcons = ["leaf-outline", "book-outline", "shield-checkmark-outline"] as const;

export function WelcomeStoryPanel() {
  const router = useRouter();
  const { showStaffPortal } = useStaffPortalVisibility();

  return (
    <View style={styles.panel}>
      <View>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/images/trinity-symbol.png")}
            resizeMode="contain"
            style={styles.symbol}
          />
          <View>
            <Text style={styles.brandName}>Trinity Health Solution</Text>
            <Text style={styles.brandTagline}>{storyCopy.eyebrow}</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>
          <Text style={styles.eyebrowDot}>● </Text>
          {storyCopy.eyebrow}
        </Text>
        <Text style={styles.headline}>
          {storyCopy.headlineFirst}{" "}
          <Text style={styles.headlineEmphasis}>{storyCopy.headlineSecond}</Text>
        </Text>
        <Text style={styles.description}>{storyCopy.description}</Text>
        <PatternDivider />
        <View style={styles.commitments}>
          {storyCopy.commitments.map((item, index) => (
            <View key={item} style={styles.commitment}>
              <Ionicons
                color="#438451"
                name={commitmentIcons[index]}
                size={15}
                accessibilityElementsHidden
              />
              <Text style={styles.commitmentText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {showStaffPortal ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/staff-portal" as Href)}
            style={styles.portalButton}
          >
            <Ionicons name="shield-checkmark-outline" size={15} color="#275D37" />
            <Text style={styles.portalText}>{storyCopy.portal}</Text>
            <Ionicons name="arrow-up-outline" size={14} color="#275D37" />
          </Pressable>
        ) : null}
        <Text style={styles.amharicNote}>{storyCopy.amharicNote}</Text>
        <Text style={styles.englishNote}>{storyCopy.englishNote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    justifyContent: "space-between",
    maxWidth: 430,
    paddingVertical: 38,
  },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  symbol: { height: 54, width: 58 },
  brandName: { color: "#1B492C", fontFamily: "Righteous_400Regular", fontSize: 17 },
  brandTagline: {
    color: "#5C7D5F",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 3,
  },
  eyebrow: {
    color: "#52815B",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 46,
  },
  eyebrowDot: { color: "#8FC85B" },
  headline: {
    color: "#15271B",
    fontFamily: "Righteous_400Regular",
    fontSize: 52,
    lineHeight: 56,
    marginTop: 15,
  },
  headlineEmphasis: { color: "#287A46", fontFamily: "Righteous_400Regular" },
  description: {
    color: "#56665A",
    fontFamily: "Righteous_400Regular",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 17,
  },
  commitments: { gap: 13, marginTop: 15 },
  commitment: { alignItems: "center", flexDirection: "row", gap: 10 },
  commitmentText: {
    color: "#586C5B",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
  },
  footer: { marginTop: 24 },
  portalButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFFB8",
    borderColor: "#9FBEA4",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  portalText: { color: "#275D37", fontFamily: "Righteous_400Regular", fontSize: 11 },
  amharicNote: {
    color: "#367848",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
    marginTop: 34,
  },
  englishNote: {
    color: "#788A7B",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 3,
  },
});
