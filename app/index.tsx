import { useAuth } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { AUTHENTICATED_HOME_TABS } from "../constants/authRoutes";
import WelcomeScreen from "../screens/WelcomeScreen";

const welcomeSeenKey = "trinity-welcome-seen";

const readWelcomeSeen = async () => {
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    return window.localStorage.getItem(welcomeSeenKey) === "true";
  }

  return (await SecureStore.getItemAsync(welcomeSeenKey)) === "true";
};

const markWelcomeSeen = async () => {
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    window.localStorage.setItem(welcomeSeenKey, "true");
    return;
  }

  await SecureStore.setItemAsync(welcomeSeenKey, "true");
};

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;

    const resolveFirstLaunch = async () => {
      let hasSeenWelcome = false;

      try {
        hasSeenWelcome = await readWelcomeSeen();
        if (!hasSeenWelcome) {
          await markWelcomeSeen();
        }
      } catch {
        // Keep the welcome screen available if local storage is unavailable.
      }

      if (isActive) {
        setShowWelcome(!hasSeenWelcome);
      }
    };

    void resolveFirstLaunch();

    return () => {
      isActive = false;
    };
  }, []);

  if (showWelcome === null) return null;
  if (showWelcome) return <WelcomeScreen />;
  if (!isLoaded) return null;

  const destination = isSignedIn
    ? AUTHENTICATED_HOME_TABS
    : "/public/home";

  return <Redirect href={destination as Href} />;
}
