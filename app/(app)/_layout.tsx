import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/public/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
