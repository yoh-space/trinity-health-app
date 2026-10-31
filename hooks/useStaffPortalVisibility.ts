import { useAuth, useUser } from "@clerk/expo";
import { isStaffRoleId } from "../lib/staffRoles";

export function useStaffPortalVisibility() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const roleClaim = user?.publicMetadata.role;
  const staffRole = isStaffRoleId(roleClaim) ? roleClaim : null;
  const isReady = authLoaded && userLoaded;

  return {
    isReady,
    isSignedIn: Boolean(isSignedIn),
    staffRole,
    showStaffPortal: isReady && (!isSignedIn || staffRole !== null),
  };
}
