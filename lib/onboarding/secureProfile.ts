export const ONBOARDING_PROFILE_KEY = "trinity-onboarding-profile";

export function hasSavedOnboardingProfile(value: string): boolean {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return false;
    }

    const profile = parsed as Record<string, unknown>;
    const hasTextAnswer = [
      "audience",
      "age",
      "meals",
      "activity",
      "consultation",
      "otherSupport",
      "otherGoal",
      "otherConsultation",
      "heightCm",
      "weightKg",
    ].some(
      (key) => typeof profile[key] === "string" && profile[key].trim().length > 0,
    );
    const hasListAnswer = ["support", "eatingPatterns", "goals"].some(
      (key) => Array.isArray(profile[key]) && profile[key].length > 0,
    );
    const hasMeasurement = ["heightCm", "weightKg"].some(
      (key) => typeof profile[key] === "number" && Number.isFinite(profile[key]),
    );

    return hasTextAnswer || hasListAnswer || profile.generalSupport === true || hasMeasurement;
  } catch {
    return false;
  }
}
