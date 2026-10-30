import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTrinityStore } from "../../store/useTrinityStore";

export default function PublicTabs() {
  const language = useTrinityStore((state) => state.language);
  const insets = useSafeAreaInsets();
  const am = language === "am";

  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          home: "home-outline",
          learn: "book-outline",
          food: "restaurant-outline",
          care: "heart-outline",
          saved: "bookmark-outline",
          opal: "chatbubble-ellipses-outline",
        };
        const titles: Record<string, string> = am
          ? {
              home: "መነሻ",
              learn: "ትምህርት",
              food: "ምግብ",
              care: "እንክብካቤ",
            }
          : { home: "Home", learn: "Learn", food: "Meals", care: "Care" };

        return {
          headerShown: false,
          tabBarActiveTintColor: "#087A3D",
          tabBarInactiveTintColor: "#7B897E",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E3EBE4",
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
        };
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="food" />
      <Tabs.Screen name="care" />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="opal" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen
        name="article/[articleId]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
    </Tabs>
  );
}
