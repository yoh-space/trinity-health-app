import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
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
import {
  getStaffRole,
  staffDashboardPath,
  staffRoles,
  type StaffRoleId,
} from "../lib/staffRoles";

export default function StaffPortalScreen() {
  const router = useRouter();
  const [roleId, setRoleId] = useState<StaffRoleId>("counselor");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const role = getStaffRole(roleId);

  const openDesk = () => {
    if (roleId === "clinician") {
      router.push("/staff/clinical" as Href);
      return;
    }
    if (!staffId.trim() || !password.trim()) {
      setMessage(
        "Enter your Staff ID and password, or continue with demo access.",
      );
      return;
    }
    router.push(staffDashboardPath(roleId));
  };

  const openDemo = () => {
    setMessage("");
    router.push(staffDashboardPath(roleId));
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons name="leaf-outline" size={25} color="#218243" />
              <View style={styles.logoHeart} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Staff Portal</Text>
              <Text style={styles.brandCaption}>TRINITY HEALTH SOLUTION</Text>
            </View>
          </View>

          <View style={styles.eyebrowRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={12}
              color="#4B8A5A"
            />
            <Text style={styles.eyebrow}>TEAM ACCESS</Text>
          </View>
          <Text style={styles.title}>Welcome back to care.</Text>
          <Text style={styles.subtitle}>
            Review consultations, assign the right colleague, and keep families
            informed.
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
                    style={[
                      styles.roleName,
                      selected && styles.roleNameSelected,
                    ]}
                  >
                    {item.shortLabel}
                  </Text>
                  <Text
                    style={[
                      styles.roleDescription,
                      selected && styles.roleDescriptionSelected,
                    ]}
                  >
                    {item.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.form}>
            {roleId === "clinician" ? (
              <Text style={styles.secureInfoText}>
                Use your Trinity-approved account. Clinical access is checked by
                the server; demo credentials are disabled.
              </Text>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Staff ID</Text>
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onChangeText={(value) => {
                    setStaffId(value);
                    setMessage("");
                  }}
                  placeholder="e.g. THS-0000"
                  placeholderTextColor="#9AA89E"
                  style={styles.input}
                  value={staffId}
                />
                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  onChangeText={(value) => {
                    setPassword(value);
                    setMessage("");
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#9AA89E"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={openDesk}
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.signInText}>
                {roleId === "clinician" ? "Open clinical dashboard" : "Sign in"}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </Pressable>
            {roleId !== "clinician" && (
              <Pressable
                accessibilityRole="button"
                onPress={openDemo}
                style={({ pressed }) => [
                  styles.demoButton,
                  pressed && styles.demoPressed,
                ]}
              >
                <Text style={styles.demoText}>Continue with demo access</Text>
              </Pressable>
            )}
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed-outline" size={11} color="#66806D" />
            <Text style={styles.privacyText}>
              {roleId === "clinician"
                ? "Clinical request access is verified server-side against the approved staff allowlist."
                : "Prototype sign-in; nothing is checked, stored, or sent. Sample requests are fictional and hold no personal details."}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/" as Href)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={13} color="#386248" />
            <Text style={styles.backText}>Back to the family app</Text>
          </Pressable>
          <Text style={styles.selectedDesk}>
            Opening {role.label.toLowerCase()} desk
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F0F9F1", flex: 1 },
  keyboardView: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 22,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginBottom: 21,
  },
  logoMark: {
    alignItems: "center",
    height: 39,
    justifyContent: "center",
    width: 39,
  },
  logoHeart: {
    borderColor: "#218243",
    borderRadius: 8,
    borderWidth: 1.5,
    height: 13,
    position: "absolute",
    right: 1,
    top: 14,
    transform: [{ rotate: "-28deg" }],
    width: 20,
  },
  brandTitle: { color: "#24733B", fontFamily: "Righteous_400Regular", fontSize: 11 },
  brandCaption: {
    color: "#65906D",
    fontFamily: "Righteous_400Regular",
    fontSize: 6,
    letterSpacing: 1,
    marginTop: 2,
  },
  eyebrowRow: { alignItems: "center", flexDirection: "row", gap: 4 },
  eyebrow: {
    color: "#4B8A5A",
    fontFamily: "Righteous_400Regular",
    fontSize: 7,
    letterSpacing: 1.1,
  },
  title: {
    color: "#1E4D2D",
    fontFamily: "Righteous_400Regular",
    fontSize: 21,
    lineHeight: 25,
    marginTop: 5,
  },
  subtitle: {
    color: "#6D7E72",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 4,
    maxWidth: 265,
  },
  roleGrid: { flexDirection: "row", gap: 5, marginTop: 14 },
  roleCard: {
    backgroundColor: "#F8FCF8",
    borderColor: "#D5E7D7",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  roleCardSelected: { backgroundColor: "#E0F1E3", borderColor: "#6FAA7A" },
  roleName: { color: "#476151", fontFamily: "Righteous_400Regular", fontSize: 8 },
  roleNameSelected: { color: "#276B3A" },
  roleDescription: {
    color: "#7C8A81",
    fontFamily: "Righteous_400Regular",
    fontSize: 6,
    lineHeight: 8,
    marginTop: 3,
  },
  roleDescriptionSelected: { color: "#587962" },
  form: { marginTop: 13 },
  secureInfoText: {
    color: "#5B6F60",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    lineHeight: 12,
    marginBottom: 5,
  },
  fieldLabel: {
    color: "#5B6F60",
    fontFamily: "Righteous_400Regular",
    fontSize: 7,
    marginBottom: 4,
    marginTop: 7,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D5E4D7",
    borderRadius: 7,
    borderWidth: 1,
    color: "#284331",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    height: 31,
    paddingHorizontal: 9,
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: "#93C9A4",
    borderRadius: 7,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 31,
  },
  pressed: { opacity: 0.78 },
  signInText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 8 },
  demoButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CFE1D2",
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 6,
    minHeight: 31,
  },
  demoPressed: { backgroundColor: "#F1F8F2" },
  demoText: { color: "#315C3D", fontFamily: "Righteous_400Regular", fontSize: 8 },
  message: {
    color: "#956636",
    fontFamily: "Righteous_400Regular",
    fontSize: 7,
    lineHeight: 10,
    marginTop: 7,
  },
  privacyRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  privacyText: {
    color: "#78877C",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 6,
    lineHeight: 8,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 14,
    padding: 5,
  },
  backText: { color: "#386248", fontFamily: "Righteous_400Regular", fontSize: 7 },
  selectedDesk: {
    color: "#9AA99D",
    fontFamily: "Righteous_400Regular",
    fontSize: 6,
    marginTop: 3,
    textAlign: "center",
  },
});
