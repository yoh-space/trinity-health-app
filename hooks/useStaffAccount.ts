import { useAuth, useUser } from "@clerk/expo";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { StaffRoleId } from "../lib/staffRoles";

export type StaffAccountState =
  | "loading"
  | "signedOut"
  | "wrongRole"
  | "profileMissing"
  | "profileInactive"
  | "ready";

export function useStaffAccount(role: StaffRoleId) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const hasExpectedRole = user?.publicMetadata.role === role;
  const profile = useQuery(
    api.staff.getMyProfile,
    isLoaded && isSignedIn && isUserLoaded ? {} : "skip",
  );

  let state: StaffAccountState = "loading";
  if (isLoaded && !isSignedIn) state = "signedOut";
  else if (isLoaded && isSignedIn && isUserLoaded && !hasExpectedRole) {
    state = "wrongRole";
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
  } else if (isLoaded && isSignedIn && isUserLoaded && profile?.active) {
    state = "ready";
  }

  return { state, profile, user };
}
