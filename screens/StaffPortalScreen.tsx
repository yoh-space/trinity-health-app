import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Image,
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
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
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
            <Image
              source={require("../assets/images/trinity-symbol.png")}
              resizeMode="contain"
              style={styles.brandMark}
            />
            <View style={styles.brandCopy}>
              <Text style={styles.brandTitle}>Trinity Health Solution</Text>
              <Text style={styles.brandCaption}>STAFF PORTAL</Text>
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
                  <View style={styles.roleCardTop}>
                    <View
                      style={[
                        styles.roleIcon,
                        selected && styles.roleIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={selected ? "#247640" : "#748579"}
                      />
                    </View>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#247640"
                      />
                    ) : null}
                  </View>
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
              <View style={styles.secureInfo}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#438451"
                />
                <Text style={styles.secureInfoText}>
                  Use your Trinity-approved account. Clinical access is checked
                  by the server; demo credentials are disabled.
                </Text>
              </View>
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
            <View style={styles.privacyIcon}>
              <Ionicons name="lock-closed-outline" size={16} color="#66806D" />
            </View>
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
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 },
  keyboardView: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 24,
  },
  brandMark: { width: 36, height: 36 },
  brandCopy: { gap: 3 },
  brandTitle: { color: "#23472E", fontFamily: "Righteous_400Regular", fontSize: 12 },
  brandCaption: {
    color: "#77867A",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 0.8,
  },
  eyebrowRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  eyebrow: {
    color: "#4B8A5A",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    color: "#1C3524",
    fontFamily: "Righteous_400Regular",
    fontSize: 26,
    lineHeight: 33,
    marginTop: 7,
  },
  subtitle: {
    color: "#6D7E72",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 330,
  },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 14,
    borderWidth: 1,
    width: "48%",
    minHeight: 96,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  roleCardSelected: { backgroundColor: "#EEF7EF", borderColor: "#82B28A" },
  roleCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  roleIcon: {
    alignItems: "center",
    backgroundColor: "#F2F6F2",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  roleIconSelected: { backgroundColor: "#FFFFFF" },
  roleName: { color: "#344C3A", fontFamily: "Righteous_400Regular", fontSize: 12 },
  roleNameSelected: { color: "#276B3A" },
  roleDescription: {
    color: "#7C8A81",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
  },
  roleDescriptionSelected: { color: "#587962" },
  form: { marginTop: 20 },
  secureInfo: {
    alignItems: "flex-start",
    backgroundColor: "#EEF7EF",
    borderColor: "#DDEBDD",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 13,
  },
  secureInfoText: {
    color: "#5B6F60",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 17,
  },
  fieldLabel: {
    color: "#44584A",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE7DE",
    borderRadius: 12,
    borderWidth: 1,
    color: "#284331",
    fontFamily: "Righteous_400Regular",
    fontSize: 14,
    height: 48,
    paddingHorizontal: 13,
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: "#16803F",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 48,
  },
  pressed: { opacity: 0.78 },
  signInText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 13 },
  demoButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE7DE",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 9,
    minHeight: 44,
  },
  demoPressed: { backgroundColor: "#F1F8F2" },
  demoText: { color: "#315C3D", fontFamily: "Righteous_400Regular", fontSize: 12 },
  message: {
    color: "#956636",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
  privacyRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2EAE3",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 12,
  },
  privacyIcon: {
    alignItems: "center",
    backgroundColor: "#EEF7EF",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  privacyText: {
    color: "#78877C",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 16,
    minHeight: 40,
    paddingHorizontal: 10,
  },
  backText: { color: "#386248", fontFamily: "Righteous_400Regular", fontSize: 11 },
  selectedDesk: {
    color: "#9AA99D",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    marginTop: 1,
    textAlign: "center",
  },
});
