import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "@expo-google-fonts/righteous/useFonts";
import { Righteous_400Regular } from "@expo-google-fonts/righteous/400Regular";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SystemBars } from "react-native-edge-to-edge";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ConvexClientProvider from "../../ConvexClientProvider";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Righteous_400Regular,
  });

  useEffect(() => {
    if (error) {
      console.warn("Font loading error:", error);
    }
  }, [error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SystemBars style="dark" />
        <ConvexClientProvider>
          <BottomSheetModalProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </BottomSheetModalProvider>
        </ConvexClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
