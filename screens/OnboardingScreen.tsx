import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingChoiceGrid } from "../components/onboarding/OnboardingChoiceGrid";
import { OnboardingTextField } from "../components/onboarding/OnboardingTextField";
import {
    activityOptions,
    ageOptions,
    consultationOptions,
    eatingOptions,
    goalOptions,
    mealOptions,
    onboardingCopy,
    profileOptions,
    supportOptions,
    type OnboardingStep,
} from "../components/onboarding/onboardingContent";
import { AUTHENTICATED_HOME_TABS } from "../constants/authRoutes";
import { api } from "../convex/_generated/api";
import { calculateBmi } from "../lib/onboarding/bmi";
import { ONBOARDING_PROFILE_KEY } from "../lib/onboarding/secureProfile";
import { useTrinityStore } from "../store/useTrinityStore";

type OnboardingAnswers = {
  audience: string;
  age: string;
  support: string[];
  generalSupport: boolean;
  otherSupport: string;
  meals: string;
  activity: string;
  eatingPatterns: string[];
  goals: string[];
  otherGoal: string;
  consultation: string;
  otherConsultation: string;
  heightCm: string;
  weightKg: string;
  heightUnit: "cm" | "m" | "ft";
  weightUnit: "kg" | "lb";
};

const initialAnswers: OnboardingAnswers = {
  audience: "",
  age: "",
  support: [],
  generalSupport: false,
  otherSupport: "",
  meals: "",
  activity: "",
  eatingPatterns: [],
  goals: [],
  otherGoal: "",
  consultation: "",
  otherConsultation: "",
  heightCm: "",
  weightKg: "",
  heightUnit: "cm",
  weightUnit: "kg",
};

function toggleValue(values: string[], value: string, limit?: number) {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (limit && values.length >= limit) return values;
  return [...values, value];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { isSignedIn } = useAuth();
  const savedProfile = useQuery(api.onboarding.getProfile);
  const saveProfile = useMutation(api.onboarding.saveProfile);
  const language = useTrinityStore((state) => state.language);
  const copy = onboardingCopy[language];
  const [step, setStep] = useState<OnboardingStep>(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [rememberOnDevice, setRememberOnDevice] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const profileEditStarted = useRef(false);
  const canCalculateBmi =
    answers.audience === "myself" &&
    ["age18to39", "age40to59", "age60plus"].includes(answers.age) &&
    !answers.support.includes("pregnancy");
  const heightInCm =
    answers.heightUnit === "cm"
      ? Number(answers.heightCm)
      : answers.heightUnit === "m"
        ? Number(answers.heightCm) * 100
        : Number(answers.heightCm) * 30.48;
  const weightInKg =
    answers.weightUnit === "kg"
      ? Number(answers.weightKg)
      : Number(answers.weightKg) * 0.45359237;
  const bmi =
    canCalculateBmi && answers.heightCm.trim() && answers.weightKg.trim()
      ? calculateBmi(heightInCm, weightInKg)
      : null;

  useEffect(() => {
    if (savedProfile === undefined || profileLoaded) return;
    if (profileEditStarted.current || step > 1) {
      setProfileLoaded(true);
      return;
    }

    let isCurrent = true;
    const loadProfile = async () => {
      if (savedProfile) {
        setAnswers({
          audience: savedProfile.audience ?? "",
          age: savedProfile.age ?? "",
          support: savedProfile.support ?? [],
          generalSupport: savedProfile.generalSupport ?? false,
          otherSupport: savedProfile.otherSupport ?? "",
          meals: savedProfile.meals ?? "",
          activity: savedProfile.activity ?? "",
          eatingPatterns: savedProfile.eatingPatterns ?? [],
          goals: savedProfile.goals ?? [],
          otherGoal: savedProfile.otherGoal ?? "",
          consultation: savedProfile.consultation ?? "",
          otherConsultation: savedProfile.otherConsultation ?? "",
          heightCm: savedProfile.heightCm?.toString() ?? "",
          weightKg: savedProfile.weightKg?.toString() ?? "",
        });
        setProfileLoaded(true);
        return;
      }

      try {
        const localValue = await SecureStore.getItemAsync(
          ONBOARDING_PROFILE_KEY,
        );
        if (!isCurrent || !localValue) return;
        const localProfile = JSON.parse(
          localValue,
        ) as Partial<OnboardingAnswers>;
        setAnswers({
          ...initialAnswers,
          ...localProfile,
          support: Array.isArray(localProfile.support)
            ? localProfile.support
            : [],
          eatingPatterns: Array.isArray(localProfile.eatingPatterns)
            ? localProfile.eatingPatterns
            : [],
          goals: Array.isArray(localProfile.goals) ? localProfile.goals : [],
        });
        setRememberOnDevice(true);
      } catch (error) {
        console.error(
          "Unable to load onboarding answers from this device.",
          error,
        );
      } finally {
        if (isCurrent) setProfileLoaded(true);
      }
    };

    void loadProfile();
    return () => {
      isCurrent = false;
    };
  }, [savedProfile, profileLoaded, step]);

  const update = <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) => {
    profileEditStarted.current = true;
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const exitOnboarding = () => {
    const destination =
      source === "profile"
        ? isSignedIn
          ? "/(app)/(tabs)/profile"
          : "/public/profile"
        : isSignedIn
          ? AUTHENTICATED_HOME_TABS
          : "/public/home";
    router.replace(destination as Href);
  };

  const openLearning = exitOnboarding;

  const goBack = () => {
    if (step > 1) {
      setStep((current) => (current - 1) as OnboardingStep);
      return;
    }
    exitOnboarding();
  };

  const finish = async (continueWithoutCloud = false) => {
    if (saveToAccount && !isSignedIn && !continueWithoutCloud) {
      Alert.alert(
        language === "am" ? "መግባት ያስፈልጋል" : "Sign-in required",
        copy.accountRequired,
        [
          { text: copy.stayOnScreen, style: "cancel" },
          {
            text: copy.continueWithoutCloud,
            onPress: () => void finish(true),
          },
        ],
      );
      return;
    }
    setIsFinishing(true);
    try {
      if (saveToAccount && isSignedIn && !continueWithoutCloud) {
        try {
          await saveProfile({
            consent: true,
            audience: answers.audience,
            age: answers.age,
            support: answers.support,
            generalSupport: answers.generalSupport,
            otherSupport: answers.otherSupport,
            meals: answers.meals,
            activity: answers.activity,
            eatingPatterns: answers.eatingPatterns,
            goals: answers.goals,
            otherGoal: answers.otherGoal,
            consultation: answers.consultation,
            otherConsultation: answers.otherConsultation,
            ...(bmi !== null
              ? {
                  heightCm: heightInCm,
                  weightKg: weightInKg,
                }
              : {}),
          });
        } catch (error) {
          console.error("Unable to save onboarding profile to Convex.", error);
          Alert.alert(
            language === "am"
              ? "መልሶችን ማስቀመጥ አልተቻለም"
              : "Could not save to your account",
            language === "am"
              ? "እንደገና ይሞክሩ ወይም ወደ መለያ ሳያስቀምጡ ይቀጥሉ።"
              : "Try again, or continue without saving to your account.",
            [
              {
                text: copy.continueWithoutCloud,
                onPress: () => void finish(true),
              },
              {
                text: language === "am" ? "ደግመው ይሞክሩ" : "Try again",
                onPress: () => void finish(false),
              },
            ],
          );
          return;
        }
      }
      try {
        if (rememberOnDevice) {
          await SecureStore.setItemAsync(
            ONBOARDING_PROFILE_KEY,
            JSON.stringify({ ...answers, language, updatedAt: Date.now() }),
          );
        } else {
          await SecureStore.deleteItemAsync(ONBOARDING_PROFILE_KEY);
        }
      } catch (error) {
        console.error(
          "Unable to save onboarding answers on this device.",
          error,
        );
        Alert.alert(
          language === "am"
            ? "መልሶችን ማስቀመጥ አልተቻለም"
            : "Could not save on this device",
          language === "am"
            ? "ሳያስቀምጡ መቀጠል ወይም እንደገና መሞከር ይችላሉ።"
            : "You can continue without a device copy or try again.",
          [
            { text: copy.continue, onPress: openLearning },
            {
              text: language === "am" ? "ደግመው ይሞክሩ" : "Try again",
              onPress: () => void finish(continueWithoutCloud),
            },
          ],
        );
        return;
      }
      openLearning();
    } finally {
      setIsFinishing(false);
    }
  };

  const continueToNext = () => {
    if (step < 6) {
      setStep((current) => (current + 1) as OnboardingStep);
    } else {
      void finish();
    }
  };

  const getValue = (id: string) => copy.values[id] ?? id;
  const getOptionValues = (ids: string[]) =>
    ids.length ? ids.map(getValue).join(", ") : copy.notSpecified;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.sectionLabel}>{copy.forPrompt}</Text>
            <OnboardingChoiceGrid
              options={profileOptions}
              language={language}
              selected={answers.audience}
              onSelect={(value) => update("audience", value)}
            />
            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
              {copy.age}
            </Text>
            <OnboardingChoiceGrid
              options={ageOptions}
              language={language}
              selected={answers.age}
              onSelect={(value) => update("age", value)}
              columns={3}
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.sectionLabel}>{copy.focusPrompt}</Text>
            <Text style={styles.sectionHint}>{copy.focusHint}</Text>
            <OnboardingChoiceGrid
              options={supportOptions}
              language={language}
              selected={answers.support}
              onSelect={(value) => {
                update("generalSupport", false);
                update("support", toggleValue(answers.support, value));
              }}
              multiple
            />
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: answers.generalSupport }}
              onPress={() => {
                update("generalSupport", !answers.generalSupport);
                update("support", []);
              }}
              style={[
                styles.generalOption,
                answers.generalSupport && styles.selectedGeneralOption,
              ]}
            >
              <Ionicons
                name={
                  answers.generalSupport
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={19}
                color={answers.generalSupport ? "#25804A" : "#9AAB9D"}
              />
              <Text style={styles.generalOptionText}>
                {getValue("general")}
              </Text>
            </Pressable>
            <OnboardingTextField
              label={copy.otherSupport}
              hint={copy.otherSupportHint}
              placeholder={copy.otherSupportPlaceholder}
              value={answers.otherSupport}
              onChangeText={(value) => update("otherSupport", value)}
              multiline
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.sectionLabel}>{copy.meals}</Text>
            <OnboardingChoiceGrid
              options={mealOptions}
              language={language}
              selected={answers.meals}
              onSelect={(value) => update("meals", value)}
              columns={3}
            />
            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
              {copy.activity}
            </Text>
            <OnboardingChoiceGrid
              options={activityOptions}
              language={language}
              selected={answers.activity}
              onSelect={(value) => update("activity", value)}
              columns={1}
            />
            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
              {copy.eatingPattern}
            </Text>
            <OnboardingChoiceGrid
              options={eatingOptions}
              language={language}
              selected={answers.eatingPatterns}
              onSelect={(value) =>
                update(
                  "eatingPatterns",
                  toggleValue(answers.eatingPatterns, value),
                )
              }
              multiple
            />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.sectionLabel}>{copy.goals}</Text>
            <Text style={styles.sectionHint}>{copy.goalsHint}</Text>
            <OnboardingChoiceGrid
              options={goalOptions}
              language={language}
              selected={answers.goals}
              onSelect={(value) =>
                update("goals", toggleValue(answers.goals, value, 3))
              }
              multiple
            />
            <OnboardingTextField
              label={copy.otherGoal}
              hint={copy.otherGoalHint}
              placeholder={copy.otherGoalPlaceholder}
              value={answers.otherGoal}
              onChangeText={(value) => update("otherGoal", value)}
              multiline
            />
            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
              {copy.consultation}
            </Text>
            <OnboardingChoiceGrid
              options={consultationOptions}
              language={language}
              selected={answers.consultation}
              onSelect={(value) => update("consultation", value)}
              columns={3}
            />
            <OnboardingTextField
              label={copy.otherConsultation}
              hint={copy.otherConsultationHint}
              placeholder={copy.otherConsultationPlaceholder}
              value={answers.otherConsultation}
              onChangeText={(value) => update("otherConsultation", value)}
              multiline
            />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.sectionHint}>{copy.measurementHint}</Text>
            {canCalculateBmi ? (
              <>
                <View style={styles.measurementsRow}>
                  <View style={styles.measurementField}>
                    <Text style={styles.sectionLabel}>{copy.height}</Text>
                    <View style={styles.measurementInputRow}>
                      <TextInput
                        accessibilityLabel={copy.height}
                        keyboardType="decimal-pad"
                        maxLength={6}
                        onChangeText={(value) =>
                          update("heightCm", sanitizeMeasurement(value))
                        }
                        placeholder={
                          answers.heightUnit === "cm"
                            ? "165"
                            : answers.heightUnit === "m"
                              ? "1.65"
                              : "5.4"
                        }
                        placeholderTextColor="#94A297"
                        style={styles.measurementInput}
                        value={answers.heightCm}
                      />
                      <View style={styles.unitToggleGroup}>
                        {(["cm", "m", "ft"] as const).map((unit) => (
                          <Pressable
                            key={unit}
                            accessibilityRole="button"
                            onPress={() => {
                              if (answers.heightUnit === unit) return;
                              const currentCm =
                                answers.heightUnit === "cm"
                                  ? Number(answers.heightCm)
                                  : answers.heightUnit === "m"
                                    ? Number(answers.heightCm) * 100
                                    : Number(answers.heightCm) * 30.48;
                              const converted =
                                unit === "cm"
                                  ? currentCm
                                  : unit === "m"
                                    ? currentCm / 100
                                    : currentCm / 30.48;
                              update(
                                "heightCm",
                                sanitizeMeasurement(
                                  converted.toFixed(2).replace(/\.?0+$/, ""),
                                ),
                              );
                              update("heightUnit", unit);
                            }}
                            style={[
                              styles.unitToggle,
                              answers.heightUnit === unit &&
                                styles.unitToggleActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.unitToggleText,
                                answers.heightUnit === unit &&
                                  styles.unitToggleTextActive,
                              ]}
                            >
                              {unit}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={styles.measurementField}>
                    <Text style={styles.sectionLabel}>{copy.weight}</Text>
                    <View style={styles.measurementInputRow}>
                      <TextInput
                        accessibilityLabel={copy.weight}
                        keyboardType="decimal-pad"
                        maxLength={6}
                        onChangeText={(value) =>
                          update("weightKg", sanitizeMeasurement(value))
                        }
                        placeholder={answers.weightUnit === "kg" ? "65" : "143"}
                        placeholderTextColor="#94A297"
                        style={styles.measurementInput}
                        value={answers.weightKg}
                      />
                      <View style={styles.unitToggleGroup}>
                        {(["kg", "lb"] as const).map((unit) => (
                          <Pressable
                            key={unit}
                            accessibilityRole="button"
                            onPress={() => {
                              if (answers.weightUnit === unit) return;
                              const currentKg =
                                answers.weightUnit === "kg"
                                  ? Number(answers.weightKg)
                                  : Number(answers.weightKg) * 0.45359237;
                              const converted =
                                unit === "kg"
                                  ? currentKg
                                  : currentKg / 0.45359237;
                              update(
                                "weightKg",
                                sanitizeMeasurement(
                                  converted.toFixed(2).replace(/\.?0+$/, ""),
                                ),
                              );
                              update("weightUnit", unit);
                            }}
                            style={[
                              styles.unitToggle,
                              answers.weightUnit === unit &&
                                styles.unitToggleActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.unitToggleText,
                                answers.weightUnit === unit &&
                                  styles.unitToggleTextActive,
                              ]}
                            >
                              {unit}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.bmiCard}>
                  <Text style={styles.summaryLabel}>{copy.bmiLabel}</Text>
                  <Text style={styles.bmiValue}>
                    {bmi === null ? copy.bmiUnavailable : bmi.toFixed(1)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.bmiCard}>
                <Text style={styles.measurementNotice}>
                  {copy.measurementHint}
                </Text>
              </View>
            )}
          </>
        );
      case 6:
        return (
          <>
            <View style={styles.summaryCard}>
              <SummaryRow
                label={language === "am" ? "ለ" : "For"}
                value={
                  answers.audience || answers.age
                    ? [
                        answers.audience ? getValue(answers.audience) : "",
                        answers.age ? getValue(answers.age) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : copy.notSpecified
                }
              />
              <SummaryRow
                label={copy.bmiLabel}
                value={bmi === null ? copy.notSpecified : bmi.toFixed(1)}
              />
              <SummaryRow
                label={language === "am" ? "ትኩረት" : "Focus"}
                value={
                  answers.generalSupport
                    ? getValue("general")
                    : getOptionValues(answers.support)
                }
              />
              <SummaryRow
                label={copy.otherSupport}
                value={answers.otherSupport || copy.notSpecified}
              />
              <SummaryRow
                label={language === "am" ? "የዕለት ተዕለት ልምድ" : "Routine"}
                value={
                  [
                    answers.meals ? getValue(answers.meals) : "",
                    answers.activity ? getValue(answers.activity) : "",
                    ...answers.eatingPatterns.map(getValue),
                  ]
                    .filter(Boolean)
                    .join(", ") || copy.notSpecified
                }
              />
              <SummaryRow
                label={copy.goals}
                value={getOptionValues(answers.goals)}
              />
              <SummaryRow
                label={copy.otherGoal}
                value={answers.otherGoal || copy.notSpecified}
              />
              <SummaryRow
                label={copy.consultation}
                value={
                  answers.consultation
                    ? getValue(answers.consultation)
                    : copy.notSpecified
                }
              />
              <SummaryRow
                label={copy.otherConsultation}
                value={answers.otherConsultation || copy.notSpecified}
                last
              />
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberOnDevice }}
              onPress={() => setRememberOnDevice((value) => !value)}
              style={styles.rememberRow}
            >
              <Ionicons
                name={rememberOnDevice ? "checkbox" : "square-outline"}
                size={21}
                color={rememberOnDevice ? "#24804A" : "#8B9B8E"}
              />
              <View style={styles.rememberCopy}>
                <Text style={styles.rememberTitle}>{copy.remember}</Text>
                <Text style={styles.rememberHint}>{copy.sessionOnly}</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: saveToAccount }}
              onPress={() => setSaveToAccount((value) => !value)}
              style={styles.rememberRow}
            >
              <Ionicons
                name={saveToAccount ? "checkbox" : "square-outline"}
                size={21}
                color={saveToAccount ? "#24804A" : "#8B9B8E"}
              />
              <View style={styles.rememberCopy}>
                <Text style={styles.rememberTitle}>{copy.cloudConsent}</Text>
                <Text style={styles.rememberHint}>{copy.cloudConsentHint}</Text>
              </View>
            </Pressable>
          </>
        );
    }
  };

  const skipStep = () => {
    if (step === 6) {
      void finish();
      return;
    }
    setStep((current) => (current + 1) as OnboardingStep);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={language === "am" ? "ተመለስ" : "Go back"}
              onPress={goBack}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={18} color="#325642" />
            </Pressable>
            <View style={styles.brand}>
              <Text style={styles.brandName}>Trinity Health Solution</Text>
              <Text style={styles.brandTagline}>{copy.brandTagline}</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    index < step && styles.progressComplete,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressText}>{step}/6</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headingBlock}>
              <Text style={styles.eyebrow}>{copy.profileEyebrow}</Text>
              <Text style={styles.title}>{copy.title[step]}</Text>
              <Text style={styles.subtitle}>{copy.subtitle[step]}</Text>
            </View>

            {renderStepContent()}

            <View style={styles.privacyNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#558262"
              />
              <Text style={styles.privacyText}>{copy.optionalPrivacy}</Text>
            </View>
            {step === 6 && (
              <Text style={styles.localPrivacy}>{copy.localPrivacy}</Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step === 6 ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  disabled={isFinishing}
                  onPress={() => void finish()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressedButton,
                    isFinishing && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>{copy.startPlan}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.canChange}>{copy.canChange}</Text>
              </>
            ) : (
              <View style={styles.footerActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={skipStep}
                  style={({ pressed }) => [
                    styles.skipButton,
                    pressed && styles.pressedSkip,
                  ]}
                >
                  <Text style={styles.skipText}>{copy.skip}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={continueToNext}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.continueButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>{copy.continue}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
            {step !== 6 && (
              <Pressable
                accessibilityRole="button"
                onPress={openLearning}
                style={({ pressed }) => [
                  styles.showAllButton,
                  pressed && styles.pressedSkip,
                ]}
              >
                <Text style={styles.showAllText}>{copy.showAll}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function sanitizeMeasurement(value: string) {
  return value
    .replace(",", ".")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1");
}

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, last && styles.lastSummaryRow]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 },
  keyboardView: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 17 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 49,
    justifyContent: "space-between",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E1",
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  brand: { alignItems: "center", flex: 1 },
  brandName: {
    color: "#1C5132",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
  },
  brandTagline: {
    color: "#788A7B",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    marginTop: 2,
  },
  headerSpacer: { width: 32 },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    height: 26,
  },
  progressTrack: { flex: 1, flexDirection: "row", gap: 5 },
  progressSegment: {
    backgroundColor: "#DDE9DF",
    borderRadius: 3,
    flex: 1,
    height: 4,
  },
  progressComplete: { backgroundColor: "#178243" },
  progressText: {
    color: "#617266",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  scrollContent: { paddingBottom: 14 },
  headingBlock: { marginBottom: 16, marginTop: 7 },
  eyebrow: {
    color: "#39834F",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 0.6,
  },
  title: {
    color: "#18291D",
    fontFamily: "Righteous_400Regular",
    fontSize: 23,
    lineHeight: 29,
    marginTop: 6,
  },
  subtitle: {
    color: "#657369",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  sectionLabel: {
    color: "#35483A",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    marginBottom: 8,
  },
  sectionHint: {
    color: "#77867A",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    marginBottom: 8,
    marginTop: -4,
  },
  measurementsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  measurementField: { flex: 1 },
  measurementInputRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  measurementInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE8DF",
    borderRadius: 12,
    borderWidth: 1,
    color: "#263A2D",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    minHeight: 45,
    paddingHorizontal: 12,
    flex: 1,
  },
  unitToggleGroup: { flexDirection: "row", gap: 4 },
  unitToggle: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE8DF",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 45,
    paddingHorizontal: 8,
  },
  unitToggleActive: {
    backgroundColor: "#EEF7F0",
    borderColor: "#29804A",
  },
  unitToggleText: {
    color: "#55705D",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  unitToggleTextActive: { color: "#29804A" },
  bmiCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8DD",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 13,
  },
  bmiValue: {
    color: "#1C5132",
    fontFamily: "Righteous_400Regular",
    fontSize: 20,
    marginTop: 5,
  },
  measurementNotice: {
    color: "#657369",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
  },
  sectionSpacing: { marginTop: 15 },
  generalOption: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE9E0",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
    minHeight: 43,
    paddingHorizontal: 10,
  },
  selectedGeneralOption: {
    backgroundColor: "#EEF7F0",
    borderColor: "#29804A",
  },
  generalOptionText: {
    color: "#2D5239",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
  },
  privacyNote: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginTop: 13,
  },
  privacyText: {
    color: "#62806A",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 13,
  },
  localPrivacy: {
    color: "#728076",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 7,
  },
  footer: {
    backgroundColor: "#F7FAF7",
    borderTopColor: "#E7ECE7",
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 10,
  },
  footerActions: { alignItems: "center", flexDirection: "row", gap: 9 },
  skipButton: {
    alignItems: "center",
    borderColor: "#CEDBCF",
    borderRadius: 14,
    borderWidth: 1,
    height: 49,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  skipText: {
    color: "#55705D",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#08783D",
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    height: 49,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  continueButton: { flex: 1 },
  pressedButton: { backgroundColor: "#066333", opacity: 0.88 },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
  },
  showAllButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
    minHeight: 34,
  },
  pressedSkip: { opacity: 0.6 },
  showAllText: {
    color: "#66776A",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    textDecorationLine: "underline",
    textDecorationColor: "#AAB8AC",
  },
  canChange: {
    color: "#718075",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    marginTop: 7,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E9E1",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  summaryRow: {
    borderBottomColor: "#E9EEE9",
    borderBottomWidth: 1,
    gap: 5,
    paddingVertical: 9,
  },
  lastSummaryRow: { borderBottomWidth: 0 },
  summaryLabel: {
    color: "#738176",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  summaryValue: {
    color: "#2A4131",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
  },
  rememberRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
  },
  rememberCopy: { flex: 1 },
  rememberTitle: {
    color: "#324838",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
  },
  rememberHint: {
    color: "#78877C",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    marginTop: 2,
  },
});
