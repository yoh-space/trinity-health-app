import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrinityTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#087A3D",
      tabBarInactiveTintColor: "#738278",
      tabBarStyle: {
        borderTopColor: "#DCE9DE",
        height: 68 + insets.bottom,
        paddingBottom: insets.bottom,
        paddingTop: 8,
      },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          index: "home-outline",
          learn: "library-outline",
          care: "heart-outline",
          profile: "person-outline",
        };
        return <Ionicons color={color} name={icons[route.name]} size={size} />;
      },
    })}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="learn" options={{ title: "Learn" }} />
      <Tabs.Screen name="care" options={{ title: "Care" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
