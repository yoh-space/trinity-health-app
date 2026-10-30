export const AUTHENTICATED_HOME_TABS = "/(app)/(tabs)" as const;
export const AUTHENTICATED_CARE_TAB = "/(app)/(tabs)/care" as const;

export type AuthReturnRoute =
  | typeof AUTHENTICATED_HOME_TABS
  | typeof AUTHENTICATED_CARE_TAB;
