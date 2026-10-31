import { useAuth, useUser } from "@clerk/expo";
import { useQuery } from "convex/react";
import { createContext, useContext, type ReactNode } from "react";
import { api } from "../../convex/_generated/api";

type StaffAccountContextValue = {
  authLoaded: boolean;
  signedIn: boolean;
  userLoaded: boolean;
  user: ReturnType<typeof useUser>["user"];
  profile: ReturnType<typeof useQuery<typeof api.staff.getMyProfile>>;
};

const StaffAccountContext = createContext<StaffAccountContextValue | null>(null);

export function StaffAccountProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const profile = useQuery(
    api.staff.getMyProfile,
    authLoaded && isSignedIn && userLoaded ? {} : "skip",
  );

  return (
    <StaffAccountContext.Provider
      value={{
        authLoaded,
        signedIn: Boolean(isSignedIn),
        userLoaded,
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
