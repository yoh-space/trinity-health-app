import { StyleSheet, View } from "react-native";

const diamonds = Array.from({ length: 31 }, (_, index) => index);

export function PatternDivider() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.row}>
      {diamonds.map((diamond) => (
        <View
          key={diamond}
          style={[
            styles.diamond,
            diamond % 4 === 0
              ? styles.darkDiamond
              : diamond % 2 === 0
                ? styles.greenDiamond
                : styles.lightDiamond,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingVertical: 5,
  },
  diamond: { height: 5, transform: [{ rotate: "45deg" }], width: 5 },
  darkDiamond: { backgroundColor: "#277943" },
  greenDiamond: { backgroundColor: "#89C878" },
  lightDiamond: { backgroundColor: "#B5D8AC" },
});
