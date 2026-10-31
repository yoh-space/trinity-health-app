import { Redirect, type Href } from "expo-router";
import { AUTHENTICATED_HOME_TABS } from "../constants/authRoutes";
import { useTrinityStore } from "../store/useTrinityStore";

// Match Clerk's callback route pattern from mez-app, returning to the
// destination selected before OAuth started.
export default function SSOCallbackRoute() {
  const authReturnTo = useTrinityStore((state) => state.authReturnTo);

  return (
    <Redirect href={(authReturnTo ?? AUTHENTICATED_HOME_TABS) as Href} />
  );
}
