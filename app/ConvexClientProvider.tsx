import { type ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

// These are public client-side values. The fallbacks keep an installed native
// build from crashing before the first screen when Metro did not inline a
// local .env file; production secrets are never used by the native client.
const convexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  "https://limitless-squirrel-32.convex.cloud";
const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_test_ZW5hYmxlZC1zdGFnLTU4OS5jbGVyay5hY2NvdW50cy5kZXYk";

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
