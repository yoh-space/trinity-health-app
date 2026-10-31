import { useAuth } from "@clerk/expo";
import { Redirect, Stack, type Href } from "expo-router";
import { AUTHENTICATED_HOME_TABS } from "../../constants/authRoutes";
import { useTrinityStore } from "../../store/useTrinityStore";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const authReturnTo = useTrinityStore((state) => state.authReturnTo);

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <Redirect href={(authReturnTo ?? AUTHENTICATED_HOME_TABS) as Href} />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
