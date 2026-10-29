export const BMI_INPUT_LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 25, max: 300 },
} as const;

/** Returns a rounded adult BMI, or null when either measurement is absent/invalid. */
export function calculateBmi(heightCm: number, weightKg: number): number | null {
  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm < BMI_INPUT_LIMITS.heightCm.min ||
    heightCm > BMI_INPUT_LIMITS.heightCm.max ||
    weightKg < BMI_INPUT_LIMITS.weightKg.min ||
    weightKg > BMI_INPUT_LIMITS.weightKg.max
  ) {
    return null;
  }

  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
