import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useMutation } from "convex/react";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { staffTabPath, type StaffRoleId, type StaffTabId } from "../../lib/staffRoles";
import { StaffAccessState } from "./StaffDashboardPrimitives";
import type { StaffAccountState } from "../../hooks/useStaffAccount";

const tabs: {
  id: StaffTabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "home", label: "Home", icon: "home-outline" },
  { id: "requests", label: "Requests", icon: "list-outline" },
  { id: "team", label: "Team", icon: "people-outline" },
];

export function StaffBottomNavigation({
  role,
  selected,
}: {
  role: StaffRoleId;
  selected: StaffTabId;
}) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/staff-portal" as Href);
    } catch (error) {
      console.error("Staff sign-out failed.", error);
      Alert.alert("Could not sign out", "Please try again.");
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.navSafeArea}>
      <View accessibilityRole="tablist" style={styles.nav}>
        {tabs.map((tab) => {
          const isSelected = selected === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                if (!isSelected) router.replace(staffTabPath(role, tab.id));
              }}
              style={styles.navItem}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={isSelected ? "#087A3D" : "#718077"}
              />
              <Text style={[styles.navLabel, isSelected && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={() => void handleSignOut()}
          style={styles.navItem}
        >
          <Ionicons name="log-out-outline" size={20} color="#718077" />
          <Text style={styles.navLabel}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const specialtyByRole: Record<StaffRoleId, string> = {
  counselor: "Nutrition & education",
  clinician: "NCD & therapy",
  admin: "Service administration",
};

export function StaffProfileSetup({
  role,
  initialName,
}: {
  role: StaffRoleId;
  initialName: string;
}) {
  const createProfile = useMutation(api.staff.ensureMyProfile);
  const [displayName, setDisplayName] = useState(initialName);
  const [specialty, setSpecialty] = useState(specialtyByRole[role]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setBusy(true);
    setError("");
    try {
      await createProfile({ displayName, specialty });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not create your staff profile. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.setupSafeArea}>
      <ScrollView
        contentContainerStyle={styles.setupContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.setupIcon}>
          <Ionicons name="people-outline" size={24} color="#267642" />
        </View>
        <Text style={styles.setupEyebrow}>STAFF DIRECTORY</Text>
        <Text style={styles.setupTitle}>Set up your staff profile</Text>
        <Text style={styles.setupDescription}>
          This information appears to other authorized staff in the team directory. Your role comes from the verified Clerk account.
        </Text>

        <Text style={styles.fieldLabel}>Display name</Text>
        <TextInput
          accessibilityLabel="Display name"
          autoCapitalize="words"
          maxLength={80}
          onChangeText={setDisplayName}
          placeholder="Your name"
          style={styles.input}
          value={displayName}
        />

        <Text style={styles.fieldLabel}>Specialty or focus area</Text>
        <TextInput
          accessibilityLabel="Specialty or focus area"
          maxLength={100}
          onChangeText={setSpecialty}
          placeholder="Your specialty"
          style={styles.input}
          value={specialty}
        />

        {!!error && <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>}
        <Pressable
          accessibilityRole="button"
          disabled={busy || !displayName.trim() || !specialty.trim()}
          onPress={() => void handleSave()}
          style={[
            styles.primaryButton,
            (busy || !displayName.trim() || !specialty.trim()) && styles.disabledButton,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Save profile</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function StaffAccountStateScreen({
  state,
  role,
  initialName,
}: {
  state: StaffAccountState;
  role: StaffRoleId;
  initialName: string;
}) {
  const router = useRouter();
  if (state === "ready") return null;
  if (state === "profileMissing") {
    return <StaffProfileSetup role={role} initialName={initialName} />;
  }
  if (state === "loading") {
    return <StaffAccessState loading title="Loading staff access…" body="" />;
  }
  if (state === "signedOut") {
    return (
      <StaffAccessState
        icon="lock-closed-outline"
        title="Sign in required"
        body="This staff dashboard is available only to authenticated staff."
        actionLabel="Open staff sign-in"
        onAction={() => router.replace("/staff-portal" as Href)}
      />
    );
  }
  if (state === "wrongRole") {
    return (
      <StaffAccessState
        icon="shield-checkmark-outline"
        title="Staff role mismatch"
        body="Your Clerk account does not have the role required for this dashboard. Ask an administrator to check your public metadata role."
        actionLabel="Back to staff portal"
        onAction={() => router.replace("/staff-portal" as Href)}
      />
    );
  }
  return (
    <StaffAccessState
      icon="shield-checkmark-outline"
      title="Staff profile inactive"
      body="Your staff directory profile is inactive or has a different role. Ask an administrator to update it."
      actionLabel="Back to staff portal"
      onAction={() => router.replace("/staff-portal" as Href)}
    />
  );
}

const styles = StyleSheet.create({
  navSafeArea: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#DCE9DE",
    borderTopWidth: 1,
  },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    minHeight: 59,
    paddingHorizontal: 5,
    paddingTop: 4,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 52,
  },
  navLabel: {
    color: "#718077",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
  },
  navLabelActive: { color: "#087A3D" },
  setupSafeArea: { backgroundColor: "#F5F8F5", flex: 1 },
  setupContent: { flexGrow: 1, justifyContent: "center", padding: 22 },
  setupIcon: {
    alignItems: "center",
    backgroundColor: "#EAF4EB",
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  setupEyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 16,
  },
  setupTitle: {
    color: "#1C3524",
    fontFamily: "Righteous_400Regular",
    fontSize: 22,
    marginTop: 6,
  },
  setupDescription: {
    color: "#6D7D71",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#304936",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7E4D8",
    borderRadius: 11,
    borderWidth: 1,
    color: "#243B2A",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#B42318",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#267642",
    borderRadius: 11,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 46,
  },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
  },
});
