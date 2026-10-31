import { Ionicons } from "@expo/vector-icons";
import { useMutation, usePaginatedQuery } from "convex/react";
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
import {
  StaffAccountStateScreen,
  StaffBottomNavigation,
} from "../components/staff/StaffDashboardNavigation";
import { StaffActionButton } from "../components/staff/StaffDashboardPrimitives";
import { api } from "../convex/_generated/api";
import { useStaffAccount } from "../hooks/useStaffAccount";
import type { StaffRoleId } from "../lib/staffRoles";

const roles: { id: StaffRoleId; label: string; note: string }[] = [
  { id: "counselor", label: "Counselor", note: "Nutrition & education" },
  { id: "clinician", label: "Clinician", note: "NCD & therapy" },
  { id: "admin", label: "Admin", note: "Service administration" },
];

export default function StaffTeamScreen({ role }: { role: StaffRoleId }) {
  const account = useStaffAccount(role);
  const [showAddForm, setShowAddForm] = useState(false);
  const [clerkUserId, setClerkUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [newRole, setNewRole] = useState<StaffRoleId>("counselor");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const team = usePaginatedQuery(
    api.staff.listTeamMembers,
    account.state === "ready" ? { includeInactive: role === "admin" } : "skip",
    { initialNumItems: 20 },
  );
  const updateAvailability = useMutation(api.staff.updateMyAvailability);
  const updateMember = useMutation(api.staff.updateTeamMember);
  const createMember = useMutation(api.staff.createTeamMember);

  if (account.state !== "ready") {
    return (
      <StaffAccountStateScreen
        state={account.state}
        role={role}
        initialName={account.user?.fullName ?? ""}
      />
    );
  }

  if (team.status === "LoadingFirstPage") {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color="#267642" />
          <Text style={styles.loadingText}>Loading the staff directory…</Text>
        </View>
        <StaffBottomNavigation role={role} selected="team" />
      </SafeAreaView>
    );
  }

  const saveAvailability = async (availability: "available" | "away") => {
    setBusyId(String(account.profile?._id ?? "self"));
    try {
      await updateAvailability({ availability });
    } catch (error) {
      console.error("Staff availability update failed.", error);
      Alert.alert("Could not update availability", "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleMemberActive = async (
    member: (typeof team.results)[number],
  ) => {
    if (!member.clerkUserId) return;
    setBusyId(String(member._id));
    try {
      await updateMember({
        profileId: member._id,
        displayName: member.displayName,
        specialty: member.specialty,
        active: !member.active,
      });
    } catch (error) {
      console.error("Staff directory update failed.", error);
      Alert.alert("Could not update staff member", "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const addMember = async () => {
    setCreating(true);
    try {
      await createMember({ clerkUserId, displayName, specialty, role: newRole });
      setClerkUserId("");
      setDisplayName("");
      setSpecialty("");
      setNewRole("counselor");
      setShowAddForm(false);
    } catch (error) {
      console.error("Staff profile creation failed.", error);
      Alert.alert(
        "Could not add staff member",
        error instanceof Error ? error.message : "Please check the details and try again.",
      );
    } finally {
      setCreating(false);
    }
  };

  const myProfileId = account.profile?._id;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>TRINITY · STAFF DIRECTORY</Text>
          <Text style={styles.title}>Care team</Text>
          <Text style={styles.subtitle}>
            Active staff profiles and the focus areas they support.
          </Text>
        </View>

        {myProfileId ? (
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityCopy}>
              <Text style={styles.cardTitle}>Your availability</Text>
              <Text style={styles.cardSubtitle}>
                {account.profile?.availability === "away"
                  ? "You are marked away in the staff directory."
                  : "You are listed as available to the care team."}
              </Text>
            </View>
            <StaffActionButton
              label={
                busyId === String(myProfileId)
                  ? "Saving…"
                  : account.profile?.availability === "away"
                    ? "Set available"
                    : "Set away"
              }
              icon={account.profile?.availability === "away" ? "checkmark-outline" : "time-outline"}
              disabled={busyId === String(myProfileId)}
              secondary
              onPress={() =>
                void saveAvailability(
                  account.profile?.availability === "away" ? "available" : "away",
                )
              }
            />
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Team members</Text>
            <Text style={styles.sectionSubtitle}>
              Directory details come from active Convex staff profiles.
            </Text>
          </View>
          {role === "admin" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAddForm((value) => !value)}
              style={styles.addButton}
            >
              <Ionicons name={showAddForm ? "close" : "person-add-outline"} size={17} color="#267642" />
            </Pressable>
          ) : null}
        </View>

        {showAddForm && role === "admin" ? (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Add a staff profile</Text>
            <Text style={styles.formHint}>
              First assign the same role in Clerk public metadata. This directory entry does not grant Clerk sign-in access.
            </Text>
            <Text style={styles.fieldLabel}>Clerk user ID</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setClerkUserId}
              placeholder="user_…"
              style={styles.input}
              value={clerkUserId}
            />
            <Text style={styles.fieldLabel}>Display name</Text>
            <TextInput
              onChangeText={setDisplayName}
              placeholder="Staff member name"
              style={styles.input}
              value={displayName}
            />
            <Text style={styles.fieldLabel}>Specialty or focus area</Text>
            <TextInput
              onChangeText={setSpecialty}
              placeholder="For example, family nutrition"
              style={styles.input}
              value={specialty}
            />
            <Text style={styles.fieldLabel}>Clerk role</Text>
            <View style={styles.roleChoices}>
              {roles.map((item) => {
                const selected = newRole === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => setNewRole(item.id)}
                    style={[styles.roleChoice, selected && styles.roleChoiceSelected]}
                  >
                    <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={styles.roleNote}>{item.note}</Text>
                  </Pressable>
                );
              })}
            </View>
            <StaffActionButton
              label={creating ? "Adding…" : "Add to directory"}
              icon="person-add-outline"
              disabled={
                creating ||
                !clerkUserId.trim() ||
                !displayName.trim() ||
                !specialty.trim()
              }
              onPress={() => void addMember()}
            />
          </View>
        ) : null}

        {team.results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={25} color="#76A17E" />
            <Text style={styles.emptyTitle}>No staff profiles yet</Text>
            <Text style={styles.emptyBody}>
              Staff accounts appear here after they create their profile or an admin adds them.
            </Text>
          </View>
        ) : (
          <View style={styles.memberList}>
            {team.results.map((member) => {
              const isMe = member._id === myProfileId;
              const roleInfo = roles.find((item) => item.id === member.role);
              return (
                <View key={member._id} style={styles.memberCard}>
                  <View style={styles.memberTop}>
                    <View style={styles.memberIcon}>
                      <Ionicons
                        name={member.role === "clinician" ? "medkit-outline" : member.role === "admin" ? "shield-outline" : "heart-outline"}
                        size={17}
                        color="#347447"
                      />
                    </View>
                    <View style={styles.memberCopy}>
                      <Text style={styles.memberName}>
                        {member.displayName}{isMe ? " · You" : ""}
                      </Text>
                      <Text style={styles.memberRole}>{roleInfo?.label ?? member.role}</Text>
                      <Text style={styles.memberSpecialty}>{member.specialty}</Text>
                    </View>
                    <View style={[styles.statusDot, !member.active && styles.statusDotInactive]} />
                  </View>
                  <View style={styles.memberFooter}>
                    <Text style={[styles.availabilityLabel, member.availability === "away" && styles.awayLabel]}>
                      {member.active
                        ? member.availability === "away"
                          ? "Away"
                          : "Available"
                        : "Inactive"}
                    </Text>
                    <Text style={styles.workloadLabel}>
                      {member.openRequestCount} open
                    </Text>
                    {role === "admin" && !isMe ? (
                      <Pressable
                        accessibilityRole="button"
                        disabled={busyId === String(member._id)}
                        onPress={() => void toggleMemberActive(member)}
                      >
                        <Text style={styles.memberAction}>
                          {busyId === String(member._id)
                            ? "Saving…"
                            : member.active
                              ? "Deactivate"
                              : "Reactivate"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {team.status === "CanLoadMore" || team.status === "LoadingMore" ? (
          <Pressable
            accessibilityRole="button"
            disabled={team.status === "LoadingMore"}
            onPress={() => team.loadMore(20)}
            style={styles.loadMoreButton}
          >
            {team.status === "LoadingMore" ? (
              <ActivityIndicator color="#267642" size="small" />
            ) : (
              <Text style={styles.loadMoreText}>Load more team members</Text>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
      <StaffBottomNavigation role={role} selected="team" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F5F8F5", flex: 1 },
  content: { padding: 16, paddingBottom: 26 },
  loadingState: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center" },
  loadingText: { color: "#6D7D71", fontFamily: "Righteous_400Regular", fontSize: 10 },
  header: { marginBottom: 18 },
  eyebrow: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 9, letterSpacing: 1 },
  title: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 23, marginTop: 6 },
  subtitle: { color: "#6D7D71", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15, marginTop: 5 },
  availabilityCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 22,
    padding: 12,
  },
  availabilityCopy: { flex: 1, gap: 4 },
  cardTitle: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 12 },
  cardSubtitle: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 13 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11 },
  sectionCopy: { flex: 1 },
  sectionTitle: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 17 },
  sectionSubtitle: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 14, marginTop: 4 },
  addButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DCE9DE", borderRadius: 10, borderWidth: 1, height: 38, justifyContent: "center", width: 38 },
  formCard: { backgroundColor: "#FFFFFF", borderColor: "#DCE9DE", borderRadius: 14, borderWidth: 1, gap: 8, marginBottom: 13, padding: 13 },
  formHint: { color: "#6D7D71", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 13 },
  fieldLabel: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 9, marginTop: 6 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#D7E4D8", borderRadius: 9, borderWidth: 1, color: "#243B2A", fontFamily: "Righteous_400Regular", fontSize: 10, minHeight: 40, paddingHorizontal: 10 },
  roleChoices: { gap: 6 },
  roleChoice: { backgroundColor: "#FFFFFF", borderColor: "#D7E4D8", borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  roleChoiceSelected: { backgroundColor: "#EEF7F0", borderColor: "#33804A" },
  roleLabel: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 10 },
  roleLabelSelected: { color: "#267642" },
  roleNote: { color: "#7C8A7E", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 2 },
  memberList: { gap: 9 },
  memberCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 14, borderWidth: 1, padding: 12 },
  memberTop: { alignItems: "center", flexDirection: "row", gap: 9 },
  memberIcon: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 10, height: 34, justifyContent: "center", width: 34 },
  memberCopy: { flex: 1, gap: 3 },
  memberName: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 11 },
  memberRole: { color: "#357347", fontFamily: "Righteous_400Regular", fontSize: 8 },
  memberSpecialty: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8 },
  statusDot: { backgroundColor: "#4BA269", borderRadius: 5, height: 9, width: 9 },
  statusDotInactive: { backgroundColor: "#A0AAA1" },
  memberFooter: { alignItems: "center", borderTopColor: "#EEF2EE", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 8 },
  availabilityLabel: { color: "#498158", fontFamily: "Righteous_400Regular", fontSize: 8 },
  awayLabel: { color: "#927332" },
  workloadLabel: { color: "#6D7D71", fontFamily: "Righteous_400Regular", fontSize: 8 },
  memberAction: { color: "#A64236", fontFamily: "Righteous_400Regular", fontSize: 8 },
  emptyState: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 14, borderWidth: 1, padding: 22 },
  emptyTitle: { color: "#34523C", fontFamily: "Righteous_400Regular", fontSize: 12, marginTop: 8 },
  emptyBody: { color: "#78877C", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 14, marginTop: 5, textAlign: "center" },
  loadMoreButton: { alignItems: "center", borderColor: "#D4E3D6", borderRadius: 11, borderWidth: 1, justifyContent: "center", marginTop: 12, minHeight: 42 },
  loadMoreText: { color: "#267642", fontFamily: "Righteous_400Regular", fontSize: 9 },
});
