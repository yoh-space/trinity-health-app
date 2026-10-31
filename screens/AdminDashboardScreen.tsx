import { Ionicons } from "@expo/vector-icons";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../convex/_generated/api";
import {
  StaffAccessState,
  StaffMetricCard,
} from "../components/staff/StaffDashboardPrimitives";
import {
  StaffAccountStateScreen,
  StaffBottomNavigation,
} from "../components/staff/StaffDashboardNavigation";
import { useStaffAccount } from "../hooks/useStaffAccount";
import { staffTabPath } from "../lib/staffRoles";

type RequestStatus = "submitted" | "inReview" | "contacted" | "closed";
type CountValue = number | "100+";
type RequestCounts = Record<RequestStatus, CountValue>;

const statusRows: { status: RequestStatus; label: string }[] = [
  { status: "submitted", label: "New" },
  { status: "inReview", label: "In review" },
  { status: "contacted", label: "Contacted" },
  { status: "closed", label: "Closed" },
];

function addCounts(...values: (CountValue | undefined)[]): CountValue {
  if (values.some((value) => value === "100+")) return "100+";
  return values.reduce<number>(
    (total, value) => total + (typeof value === "number" ? value : 0),
    0,
  );
}

function formatStatus(status: RequestStatus) {
  switch (status) {
    case "submitted":
      return "New";
    case "inReview":
      return "In review";
    case "contacted":
      return "Contacted";
    case "closed":
      return "Closed";
  }
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [now] = useState(() => Date.now());
  const { state: staffAccountState, user, profile } = useStaffAccount("admin");
  const overview = useQuery(
    api.careRequests.getAdminDashboardOverview,
    staffAccountState === "ready" ? {} : "skip",
  );
  const team = usePaginatedQuery(
    api.staff.listTeamMembers,
    staffAccountState === "ready" ? { includeInactive: false } : "skip",
    { initialNumItems: 5 },
  );
  const appointments = useQuery(
    api.appointments.listUpcomingForAdmin,
    staffAccountState === "ready" ? { now } : "skip",
  );

  if (staffAccountState !== "ready") {
    return (
      <StaffAccountStateScreen
        state={staffAccountState}
        role="admin"
        initialName={user?.fullName ?? ""}
      />
    );
  }

  if (overview === undefined) {
    return <StaffAccessState loading title="Loading service overview…" body="" />;
  }

  const displayName = profile?.displayName.trim().split(/\s+/)[0] || user?.firstName?.trim() || "Administrator";
  const clinical = overview.counts.clinical as RequestCounts;
  const counselling = overview.counts.counselling as RequestCounts;
  const counts = {
    submitted: addCounts(clinical.submitted, counselling.submitted),
    inReview: addCounts(clinical.inReview, counselling.inReview),
    contacted: addCounts(clinical.contacted, counselling.contacted),
    closed: addCounts(clinical.closed, counselling.closed),
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>TRINITY · ADMIN OVERVIEW</Text>
            <Text style={styles.title}>Service at a glance</Text>
            <Text style={styles.subtitle}>Welcome, {displayName}.</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <StaffMetricCard
            label="New"
            value={counts.submitted}
            icon="mail-unread-outline"
          />
          <StaffMetricCard
            label="In review"
            value={counts.inReview}
            icon="eye-outline"
          />
          <StaffMetricCard
            label="Contacted"
            value={counts.contacted}
            icon="call-outline"
          />
          <StaffMetricCard
            label="Closed"
            value={counts.closed}
            icon="checkmark-done-outline"
          />
        </View>

        <View style={styles.scopeNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#4D7A59" />
          <Text style={styles.scopeText}>
            This overview uses request status and assignment metadata only. Family contact details and summaries stay in the authorized care queues.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Request queues</Text>
            <Text style={styles.sectionSubtitle}>
              Live counts grouped by service and follow-up status
            </Text>
          </View>
        </View>

        <QueueSummaryCard
          title="Clinical"
          icon="medkit-outline"
          counts={clinical}
        />
        <QueueSummaryCard
          title="Counselling"
          icon="heart-outline"
          counts={counselling}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Team workload</Text>
            <Text style={styles.sectionSubtitle}>
              Open requests assigned to active staff
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(staffTabPath("admin", "team"))}
          >
            <Text style={styles.textLink}>Manage</Text>
          </Pressable>
        </View>

        {team.status === "LoadingFirstPage" ? (
          <View style={styles.inlineLoading}>
            <Text style={styles.inlineLoadingText}>Loading staff directory…</Text>
          </View>
        ) : team.results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyBody}>No active staff profiles are registered yet.</Text>
          </View>
        ) : (
          <View style={styles.workloadCard}>
            {team.results.map((member) => (
              <View key={member._id} style={styles.workloadRow}>
                <View style={styles.workloadCopy}>
                  <Text style={styles.workloadName}>{member.displayName}</Text>
                  <Text style={styles.workloadRole}>
                    {member.role === "clinician" ? "Clinician" : member.role === "counselor" ? "Counselor" : "Admin"}
                    {" · "}
                    {member.specialty}
                  </Text>
                </View>
                <Text style={styles.workloadCount}>{member.openRequestCount}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Latest requests</Text>
            <Text style={styles.sectionSubtitle}>
              Newest activity across both service queues
            </Text>
          </View>
        </View>

        {overview.recentRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-outline"
              size={25}
              color="#76A17E"
            />
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyBody}>
              Family requests will appear here after they are submitted.
            </Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {overview.recentRequests.map((request) => (
              <View key={request._id} style={styles.recentCard}>
                <View style={styles.recentIcon}>
                  <Ionicons
                    name={request.requestType === "clinical" ? "medkit-outline" : "heart-outline"}
                    size={16}
                    color="#347447"
                  />
                </View>
                <View style={styles.recentCopy}>
                  <View style={styles.recentTitleRow}>
                    <Text style={styles.requestId}>
                      Request · {String(request._id).slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.statusBadge}>
                      {formatStatus(request.status)}
                    </Text>
                  </View>
                  <Text style={styles.requestType}>
                    {request.requestType === "clinical" ? "Clinical" : "Counselling"}
                    {" · "}
                    {request.assigned ? "Assigned" : "Awaiting assignment"}
                  </Text>
                  <Text style={styles.requestDate}>
                    Submitted {new Date(request.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Upcoming sessions</Text>
            <Text style={styles.sectionSubtitle}>
              Scheduled sessions from active care requests
            </Text>
          </View>
        </View>

        {appointments === undefined ? (
          <View style={styles.inlineLoading}>
            <Text style={styles.inlineLoadingText}>Loading sessions…</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyBody}>No future sessions are scheduled.</Text>
          </View>
        ) : (
          <View style={styles.workloadCard}>
            {appointments.map((appointment) => (
              <View key={appointment._id} style={styles.workloadRow}>
                <View style={styles.workloadCopy}>
                  <Text style={styles.workloadName}>
                    {new Date(appointment.scheduledAt).toLocaleString()}
                  </Text>
                  <Text style={styles.workloadRole}>
                    {appointment.requestType === "clinical" ? "Clinical" : "Counselling"}
                    {" · "}
                    {appointment.staffName}
                    {" · "}
                    {appointment.format === "online" ? "Online" : "In person"}
                  </Text>
                </View>
                <Text style={styles.workloadCount}>{appointment.durationMinutes}m</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footerNote}>
          Workload and session details come from the staff directory and scheduled care appointments. Counts above 100 are shown as “100+”.
        </Text>
      </ScrollView>
      <StaffBottomNavigation role="admin" selected="home" />
    </SafeAreaView>
  );
}

function QueueSummaryCard({
  title,
  icon,
  counts,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  counts: RequestCounts;
}) {
  return (
    <View style={styles.queueCard}>
      <View style={styles.queueCardHeader}>
        <View style={styles.queueIcon}>
          <Ionicons name={icon} size={17} color="#347447" />
        </View>
        <Text style={styles.queueTitle}>{title}</Text>
      </View>
      <View style={styles.statusRows}>
        {statusRows.map((item) => (
          <View key={item.status} style={styles.statusRow}>
            <Text style={styles.statusLabel}>{item.label}</Text>
            <Text style={styles.statusValue}>{counts[item.status]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F5F8F5", flex: 1 },
  content: { padding: 16, paddingBottom: 34 },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  headerCopy: { flex: 1 },
  eyebrow: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    color: "#1C3524",
    fontFamily: "Righteous_400Regular",
    fontSize: 23,
    marginTop: 6,
  },
  subtitle: {
    color: "#6D7D71",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  metricsRow: { flexDirection: "row", gap: 6, marginTop: 17 },
  scopeNote: {
    alignItems: "flex-start",
    backgroundColor: "#EEF5EF",
    borderRadius: 11,
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
    padding: 11,
  },
  scopeText: {
    color: "#5A6D5F",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 14,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 22,
  },
  sectionCopy: { flex: 1 },
  sectionTitle: {
    color: "#1C3524",
    fontFamily: "Righteous_400Regular",
    fontSize: 17,
  },
  sectionSubtitle: {
    color: "#718077",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  textLink: { color: "#267642", fontFamily: "Righteous_400Regular", fontSize: 9 },
  inlineLoading: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 48, padding: 10 },
  inlineLoadingText: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 9 },
  workloadCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 14, borderWidth: 1, paddingHorizontal: 12 },
  workloadRow: { alignItems: "center", borderBottomColor: "#EEF2EE", borderBottomWidth: 1, flexDirection: "row", gap: 10, justifyContent: "space-between", paddingVertical: 10 },
  workloadCopy: { flex: 1, gap: 3 },
  workloadName: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 9 },
  workloadRole: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12 },
  workloadCount: { color: "#245D37", fontFamily: "Righteous_400Regular", fontSize: 11 },
  queueCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
    padding: 13,
  },
  queueCardHeader: { alignItems: "center", flexDirection: "row", gap: 9 },
  queueIcon: {
    alignItems: "center",
    backgroundColor: "#EEF7F0",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  queueTitle: {
    color: "#304936",
    fontFamily: "Righteous_400Regular",
    fontSize: 13,
  },
  statusRows: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  statusRow: {
    alignItems: "center",
    backgroundColor: "#F7FAF7",
    borderColor: "#E6ECE6",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "space-between",
    minWidth: "46%",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusLabel: {
    color: "#6D7D71",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  statusValue: {
    color: "#245D37",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
  },
  recentList: { gap: 9 },
  recentCard: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 11,
  },
  recentIcon: {
    alignItems: "center",
    backgroundColor: "#EEF7F0",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  recentCopy: { flex: 1, gap: 4 },
  recentTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  requestId: {
    color: "#506457",
    flex: 1,
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  statusBadge: {
    backgroundColor: "#F1F4F1",
    borderRadius: 9,
    color: "#617266",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  requestType: {
    color: "#304936",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  requestDate: {
    color: "#879489",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  emptyTitle: {
    color: "#34523C",
    fontFamily: "Righteous_400Regular",
    fontSize: 12,
    marginTop: 8,
  },
  emptyBody: {
    color: "#78877C",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
    textAlign: "center",
  },
  footerNote: {
    color: "#8A968D",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 18,
    textAlign: "center",
  },
});
