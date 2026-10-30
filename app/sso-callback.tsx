import { Redirect } from "expo-router";

// Clerk's default useSSO callback is `sso-callback`; route it back through
// the auth layout so an activated session can continue into the app tabs.
export default function SSOCallbackRoute() {
  return <Redirect href="/(auth)/sign-in" />;
}
