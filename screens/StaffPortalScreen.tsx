import { Ionicons } from "@expo/vector-icons";
import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { useRouter, type Href } from "expo-router";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import GoogleIcon from "../components/icons/GoogleIcon";
import { useStaffPortalVisibility } from "../hooks/useStaffPortalVisibility";
import { AUTHENTICATED_HOME_TABS } from "../constants/authRoutes";
import {
  staffDashboardPath,
  staffRoles,
  type StaffRoleId,
} from "../lib/staffRoles";

WebBrowser.maybeCompleteAuthSession();

type AuthFlow = "signIn" | "signUp" | null;
type AuthStep = "email" | "code";

type ClerkErrorShape = {
  code?: string;
  message?: string;
  longMessage?: string;
  errors?: {
    code?: string;
    message?: string;
    longMessage?: string;
  }[];
};

function getErrorMessage(error: unknown, fallback: string) {
  const clerkError = error as ClerkErrorShape | null;
  const firstError = clerkError?.errors?.[0];
  return (
    firstError?.longMessage ??
    firstError?.message ??
    clerkError?.longMessage ??
    clerkError?.message ??
    fallback
  );
}

function isMissingIdentifierError(error: unknown) {
  const clerkError = error as ClerkErrorShape | null;
  const code = clerkError?.errors?.[0]?.code ?? clerkError?.code;
  return [
    "form_identifier_not_found",
    "identifier_not_found",
    "resource_not_found",
  ].includes(code ?? "");
}

function isCancelError(error: unknown) {
  const clerkError = error as ClerkErrorShape | null;
  const code = String(clerkError?.code ?? clerkError?.errors?.[0]?.code ?? "").toLowerCase();
  const message = String(
    clerkError?.message ?? clerkError?.errors?.[0]?.message ?? "",
  ).toLowerCase();
  return code.includes("cancel") || code === "-5" || message.includes("cancel") || message.includes("dismiss");
}

export default function StaffPortalScreen() {
  const router = useRouter();
  const {
    isReady: authReady,
    isSignedIn,
    staffRole,
  } = useStaffPortalVisibility();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [roleId, setRoleId] = useState<StaffRoleId>("counselor");
  const [step, setStep] = useState<AuthStep>("email");
  const [flow, setFlow] = useState<AuthFlow>(null);
  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [code, setCode] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [message, setMessage] = useState("");
  const isBusy =
    localLoading ||
    signInFetchStatus === "fetching" ||
    signUpFetchStatus === "fetching";

  useEffect(() => {
    if (!authReady || !isSignedIn) return;

    const destination = staffRole
      ? staffDashboardPath(staffRole)
      : AUTHENTICATED_HOME_TABS;
    router.replace(destination as Href);
  }, [authReady, isSignedIn, router, staffRole]);

  const startSignUp = async (emailAddress: string) => {
    if (!signUp) {
      setMessage("Authentication is still loading. Please try again.");
      return;
    }

    const createResult = await signUp.create({ emailAddress });
    if (createResult.error) {
      setMessage(
        getErrorMessage(createResult.error, "Could not start email verification."),
      );
      return;
    }

    const sendResult = await signUp.verifications.sendEmailCode();
    if (sendResult.error) {
      setMessage(
        getErrorMessage(sendResult.error, "Could not send the verification code."),
      );
      return;
    }

    setFlow("signUp");
    setVerifiedEmail(emailAddress);
    setCode("");
    setStep("code");
  };

  const handleContinueWithEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Enter your email address.");
      return;
    }
    if (!signIn || !signUp) {
      setMessage("Authentication is still loading. Please try again.");
      return;
    }

    setLocalLoading(true);
    setMessage("");
    try {
      await signIn.reset();
      await signUp.reset();

      const result = await signIn.emailCode.sendCode({
        emailAddress: normalizedEmail,
      });
      if (result.error) {
        if (isMissingIdentifierError(result.error)) {
          await startSignUp(normalizedEmail);
          return;
        }
        setMessage(
          getErrorMessage(result.error, "Could not send the verification code."),
        );
        return;
      }

      setFlow("signIn");
      setVerifiedEmail(normalizedEmail);
      setCode("");
      setStep("code");
    } catch (error) {
      setMessage(getErrorMessage(error, "Connection problem. Please try again."));
    } finally {
      setLocalLoading(false);
    }
  };

  const finalizeIfComplete = async (resource: {
    status: string;
    finalize: () => Promise<{ error?: unknown }>;
  }) => {
    if (resource.status !== "complete") {
      setMessage(
        "This account needs more information before sign-in can finish. Contact your staff administrator.",
      );
      return;
    }

    const { error } = await resource.finalize();
    if (error) {
      setMessage(getErrorMessage(error, "Could not activate your session."));
      return;
    }

    router.replace(staffDashboardPath(roleId));
  };

  const handleVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setMessage("Enter the verification code from your email.");
      return;
    }
    if (!flow || !signIn || !signUp) {
      setMessage("Start again by entering your email address.");
      return;
    }

    setLocalLoading(true);
    setMessage("");
    try {
      if (flow === "signUp") {
        const result = await signUp.verifications.verifyEmailCode({
          code: trimmedCode,
        });
        if (result.error) {
          setMessage(
            getErrorMessage(result.error, "That code is invalid or expired."),
          );
          return;
        }
        await finalizeIfComplete(signUp);
        return;
      }

      const result = await signIn.emailCode.verifyCode({ code: trimmedCode });
      if (result.error) {
        setMessage(
          getErrorMessage(result.error, "That code is invalid or expired."),
        );
        return;
      }
      await finalizeIfComplete(signIn);
    } catch (error) {
      setMessage(getErrorMessage(error, "Connection problem. Please try again."));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!flow || !signIn || !signUp) {
      setMessage("Start again by entering your email address.");
      return;
    }

    setLocalLoading(true);
    setMessage("");
    try {
      const result =
        flow === "signUp"
          ? await signUp.verifications.sendEmailCode()
          : await signIn.emailCode.sendCode();
      if (result.error) {
        setMessage(
          getErrorMessage(result.error, "Could not resend the verification code."),
        );
        return;
      }
      setMessage("A new verification code has been sent.");
    } catch (error) {
      setMessage(getErrorMessage(error, "Connection problem. Please try again."));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    setLocalLoading(true);
    setMessage("");
    try {
      await signIn?.reset();
      await signUp?.reset();
      setCode("");
      setVerifiedEmail("");
      setFlow(null);
      setStep("email");
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not restart sign-in."));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    setMessage("");
    try {
      const result = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({ path: "sso-callback" }),
      });

      if (result.createdSessionId && result.setActive) {
        const destination = staffDashboardPath(roleId);
        await result.setActive({
          session: result.createdSessionId,
          navigate: async ({ decorateUrl }) => {
            const url = decorateUrl(String(destination));
            if (url.startsWith("http") && typeof window !== "undefined") {
              window.location.href = url;
            } else {
              router.replace(url as Href);
            }
          },
        });
        return;
      }

      if (result.signUp?.status === "missing_requirements") {
        setMessage(
          "This Google account needs more information before it can sign in.",
        );
      }
    } catch (error) {
      if (!isCancelError(error)) {
        setMessage(getErrorMessage(error, "Could not sign in with Google."));
      }
    } finally {
      setLocalLoading(false);
    }
  };

  if (!authReady || isSignedIn) {
    return (
      <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.redirectState}>
          <ActivityIndicator color="#16803F" />
          <Text style={styles.redirectText}>
            {isSignedIn ? "Restoring your staff session…" : "Checking your session…"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Image
              source={require("../assets/images/trinity-symbol.png")}
              resizeMode="contain"
              style={styles.brandMark}
            />
            <Text style={styles.brandCaption}>STAFF PORTAL</Text>
          </View>

          <Text style={styles.title}>Welcome back to care.</Text>
          <Text style={styles.subtitle}>
            Review consultation requests, assign the right colleague, and keep
            families informed.
          </Text>

          <View accessibilityRole="radiogroup" style={styles.roleGrid}>
            {staffRoles.map((item) => {
              const selected = item.id === roleId;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={item.id}
                  onPress={() => {
                    setRoleId(item.id);
                    setMessage("");
                  }}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                >
                  <Text
                    style={[styles.roleName, selected && styles.roleNameSelected]}
                  >
                    {item.shortLabel}
                  </Text>
                  <Text style={styles.roleDescription}>{item.description}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.form}>
            {step === "email" ? (
              <>
                <Text style={styles.fieldLabel}>Email address</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBusy}
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setMessage("");
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor="#929D95"
                  returnKeyType="go"
                  style={styles.input}
                  textContentType="emailAddress"
                  value={email}
                  onSubmitEditing={() => void handleContinueWithEmail()}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={() => void handleContinueWithEmail()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    isBusy && styles.disabledButton,
                    pressed && !isBusy && styles.pressed,
                  ]}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={() => void handleGoogleSignIn()}
                  style={({ pressed }) => [
                    styles.googleButton,
                    pressed && !isBusy && styles.secondaryPressed,
                  ]}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#1C3524" />
                  ) : (
                    <>
                      <GoogleIcon size={18} />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Verification code</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBusy}
                  keyboardType="number-pad"
                  onChangeText={(value) => {
                    setCode(value);
                    setMessage("");
                  }}
                  placeholder="Enter the code"
                  placeholderTextColor="#929D95"
                  returnKeyType="done"
                  style={[styles.input, styles.codeInput]}
                  textContentType="oneTimeCode"
                  value={code}
                  onSubmitEditing={() => void handleVerifyCode()}
                />
                <Text style={styles.codeHelp}>Sent to {verifiedEmail}</Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={() => void handleVerifyCode()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    isBusy && styles.disabledButton,
                    pressed && !isBusy && styles.pressed,
                  ]}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Verify code</Text>
                      <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>
                <View style={styles.codeActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isBusy}
                    onPress={() => void handleResendCode()}
                    hitSlop={8}
                  >
                    <Text style={styles.linkText}>Resend code</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isBusy}
                    onPress={() => void handleChangeEmail()}
                    hitSlop={8}
                  >
                    <Text style={styles.linkText}>Change email</Text>
                  </Pressable>
                </View>
              </>
            )}

            {message ? (
              <Text accessibilityLiveRegion="polite" style={styles.message}>
                {message}
              </Text>
            ) : null}
          </View>

          <View style={styles.privacyRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#16803F"
            />
            <Text style={styles.privacyText}>
              Staff sign-in is handled by Clerk. Request queues are available
              only to accounts authorized for the selected staff role.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/" as Href)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back to the family app</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#FFFFFF", flex: 1 },
  redirectState: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center" },
  redirectText: { color: "#586B5F", fontSize: 13 },
  keyboardView: { flex: 1 },
  content: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 480,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    width: "100%",
  },
  brand: { alignItems: "flex-start", marginBottom: 17 },
  brandMark: { height: 76, width: 82 },
  brandCaption: {
    color: "#167839",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginTop: 2,
  },
  title: {
    color: "#08662E",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 33,
  },
  subtitle: {
    color: "#586B5F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 360,
  },
  roleGrid: { flexDirection: "row", gap: 8, marginTop: 20 },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E5D9",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 72,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  roleCardSelected: {
    backgroundColor: "#E9F4EB",
    borderColor: "#16803F",
  },
  roleName: { color: "#202B24", fontSize: 13, fontWeight: "700" },
  roleNameSelected: { color: "#173D24" },
  roleDescription: {
    color: "#65766B",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  form: { marginTop: 12 },
  fieldLabel: {
    color: "#273C2E",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E5D9",
    borderRadius: 12,
    borderWidth: 1,
    color: "#26392D",
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },
  codeInput: { letterSpacing: 3 },
  codeHelp: { color: "#6A7B70", fontSize: 12, marginTop: 8 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#16803F",
    borderRadius: 12,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 50,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  disabledButton: { opacity: 0.65 },
  pressed: { opacity: 0.82 },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E5D9",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 46,
  },
  googleButtonText: { color: "#24372B", fontSize: 14, fontWeight: "600" },
  secondaryPressed: { backgroundColor: "#F3F8F4" },
  codeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  linkText: { color: "#176C36", fontSize: 13, fontWeight: "600" },
  message: {
    color: "#9A4C24",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  privacyRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
  },
  privacyText: { color: "#697A6F", flex: 1, fontSize: 12, lineHeight: 17 },
  backButton: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 13,
    minHeight: 38,
    paddingHorizontal: 8,
  },
  backText: {
    color: "#385E44",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
