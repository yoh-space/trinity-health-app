import { Righteous_400Regular } from "@expo-google-fonts/righteous/400Regular";
import { useFonts } from "@expo-google-fonts/righteous/useFonts";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ConvexClientProvider from "./ConvexClientProvider";

// Keep the native splash screen visible until the custom font is ready.
// Without this, release builds can show un-fonted (invisible text) inputs
// on first launch because the font loads asynchronously from the CDN.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Righteous_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

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
