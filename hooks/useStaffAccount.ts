import { useStaffAccountContext } from "../components/staff/StaffAccountProvider";
import type { StaffRoleId } from "../lib/staffRoles";

export type StaffAccountState =
  | "loading"
  | "signedOut"
  | "wrongRole"
  | "profileMissing"
  | "profileInactive"
  | "accessDenied"
  | "ready";

export function useStaffAccount(role: StaffRoleId) {
  const {
    authLoaded: isLoaded,
    signedIn: isSignedIn,
    userLoaded: isUserLoaded,
    convexAuthLoading,
    convexAuthenticated,
    user,
    profile,
  } = useStaffAccountContext();
  const hasExpectedRole = user?.publicMetadata.role === role;

  let state: StaffAccountState = "loading";
  if (isLoaded && !isSignedIn) state = "signedOut";
  else if (isLoaded && isSignedIn && isUserLoaded && !hasExpectedRole) {
    state = "wrongRole";
  } else if (
    isLoaded &&
    isSignedIn &&
    isUserLoaded &&
    convexAuthLoading
  ) {
    state = "loading";
  } else if (
    isLoaded &&
    isSignedIn &&
    isUserLoaded &&
    !convexAuthenticated
  ) {
    state = "accessDenied";
  } else if (isLoaded && isSignedIn && isUserLoaded && profile === undefined) {
    state = "loading";
  } else if (isLoaded && isSignedIn && isUserLoaded && profile === null) {
    state = "profileMissing";
  } else if (
    isLoaded &&
    isSignedIn &&
    isUserLoaded &&
    profile &&
    (profile.role !== role || !profile.active)
  ) {
    state = "profileInactive";
  } else if (
    isLoaded &&
    isSignedIn &&
    isUserLoaded &&
    profile &&
    !profile.authorized
  ) {
    state = "accessDenied";
  } else if (
    isLoaded &&
    isSignedIn &&
    isUserLoaded &&
    profile?.active &&
    profile.authorized
  ) {
    state = "ready";
  }

  return { state, profile, user };
}
