import { useAuth, useUser } from "@clerk/expo";
import { useConvexAuth, useQuery } from "convex/react";
import { createContext, useContext, type ReactNode } from "react";
import { api } from "../../convex/_generated/api";

type StaffAccountContextValue = {
  authLoaded: boolean;
  signedIn: boolean;
  userLoaded: boolean;
  convexAuthLoading: boolean;
  convexAuthenticated: boolean;
  user: ReturnType<typeof useUser>["user"];
  profile: ReturnType<typeof useQuery<typeof api.staff.getMyProfile>>;
};

const StaffAccountContext = createContext<StaffAccountContextValue | null>(null);

export function StaffAccountProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const {
    isLoading: convexAuthLoading,
    isAuthenticated: convexAuthenticated,
  } = useConvexAuth();
  const profile = useQuery(
    api.staff.getMyProfile,
    authLoaded &&
      isSignedIn &&
      userLoaded &&
      !convexAuthLoading &&
      convexAuthenticated
      ? {}
      : "skip",
  );

  return (
    <StaffAccountContext.Provider
      value={{
        authLoaded,
        signedIn: Boolean(isSignedIn),
        userLoaded,
        convexAuthLoading,
        convexAuthenticated,
        user,
        profile,
      }}
    >
      {children}
    </StaffAccountContext.Provider>
  );
}

export function useStaffAccountContext() {
  const context = useContext(StaffAccountContext);
  if (!context) {
    throw new Error("Staff screens must be rendered inside StaffAccountProvider.");
  }
  return context;
}
