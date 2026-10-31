import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTrinityStore } from "../../../store/useTrinityStore";

export default function TrinityTabs() {
  const insets = useSafeAreaInsets();
  const language = useTrinityStore((state) => state.language);
  const am = language === "am";
  const titles: Record<string, string> = am
    ? {
        index: "መነሻ",
        learn: "ትምህርት",
        food: "ምግብ",
        care: "እንክብካቤ",
        profile: "መገለጫ",
      }
    : {
        index: "Home",
        learn: "Learn",
        food: "Meals",
        care: "Care",
        profile: "You",
      };
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: "home-outline",
    learn: "library-outline",
    food: "restaurant-outline",
    care: "heart-outline",
    profile: "person-outline",
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#087A3D",
        tabBarInactiveTintColor: "#738278",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#DCE9DE",
          height: 66 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontFamily: "Righteous_400Regular", fontSize: 10 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            color={color}
            name={icons[route.name] ?? "ellipse-outline"}
            size={size}
          />
        ),
        title: titles[route.name] ?? "",
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="food" />
      <Tabs.Screen name="care" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="opal" options={{ href: null }} />
    </Tabs>
  );
}
