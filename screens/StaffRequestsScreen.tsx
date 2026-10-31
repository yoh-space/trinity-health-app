import { Ionicons } from "@expo/vector-icons";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppointmentPlanner } from "../components/staff/AppointmentPlanner";
import {
  CareRequestCard,
  type StaffRequestStatus,
  type StaffRequestUpdateStatus,
} from "../components/staff/CareRequestCard";
import {
  StaffAccountStateScreen,
  StaffBottomNavigation,
} from "../components/staff/StaffDashboardNavigation";
import {
  StaffMetricCard,
  StaffQueueFilterButton,
} from "../components/staff/StaffDashboardPrimitives";
import { api } from "../convex/_generated/api";
import { type Id } from "../convex/_generated/dataModel";
import { useStaffAccount } from "../hooks/useStaffAccount";
import type { StaffRoleId } from "../lib/staffRoles";

type RequestFilter = "submitted" | "inReview" | "contacted" | "closed";
type RequestTypeFilter = "all" | "clinical" | "counselling";
type AdminStatusFilter = "all" | RequestFilter;

const requestFilters: { status: RequestFilter; label: string }[] = [
  { status: "submitted", label: "New" },
  { status: "inReview", label: "In review" },
  { status: "contacted", label: "Contacted" },
  { status: "closed", label: "Closed" },
];

export default function StaffRequestsScreen({ role }: { role: StaffRoleId }) {
  if (role === "admin") return <AdminRequestsScreen />;
  if (role === "clinician") return <ClinicalRequestsScreen />;
  return <CounselorRequestsScreen />;
}

function CounselorRequestsScreen() {
  const role = "counselor" as const;
  const account = useStaffAccount(role);
  const [filter, setFilter] = useState<RequestFilter>("submitted");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [schedulingRequestId, setSchedulingRequestId] =
    useState<Id<"careRequests"> | null>(null);
  const counts = useQuery(
    api.careRequests.getCounselorQueueCounts,
    account.state === "ready" ? {} : "skip",
  );
  const queue = usePaginatedQuery(
    api.careRequests.listCounselorQueue,
    account.state === "ready" ? { status: filter } : "skip",
    { initialNumItems: 20 },
  );
  const updateStatus = useMutation(api.careRequests.updateCounselorStatus);

  if (account.state !== "ready") {
    return <StaffAccountStateScreen state={account.state} role={role} initialName={account.user?.fullName ?? ""} />;
  }

  const changeStatus = async (
    requestId: Id<"careRequests">,
    status: StaffRequestUpdateStatus,
  ) => {
    setBusyId(String(requestId));
    try {
      await updateStatus({ requestId, status });
    } catch (error) {
      Alert.alert(
        "Could not update request",
        error instanceof Error ? error.message : "Refresh the queue and try again.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const closeRequest = (requestId: Id<"careRequests">) => {
    Alert.alert(
      "Close this request?",
      "Only close after the appropriate follow-up is complete. This action will be recorded.",
      [
        { text: "Keep open", style: "cancel" },
        {
          text: "Close request",
          style: "destructive",
          onPress: () => void changeStatus(requestId, "closed"),
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <QueueHeader role={role} counts={counts} />
        <QueueFilters filter={filter} counts={counts} onChange={setFilter} />
        {schedulingRequestId ? (
          <AppointmentPlanner
            requestId={schedulingRequestId}
            onClose={() => setSchedulingRequestId(null)}
          />
        ) : null}
        {queue.status === "LoadingFirstPage" ? (
          <LoadingQueue label="Loading counselling requests…" />
        ) : queue.results.length === 0 ? (
          <QueueEmpty filter={filter} />
        ) : (
          <View style={styles.requestList}>
            {queue.results.map((request) => (
              <CareRequestCard
                key={request._id}
                request={request}
                staffRole="counselor"
                busy={busyId === String(request._id)}
                onUpdateStatus={(status) => void changeStatus(request._id, status)}
                onCloseRequest={() => closeRequest(request._id)}
                onScheduleAppointment={() => setSchedulingRequestId(request._id)}
              />
            ))}
          </View>
        )}
        <LoadMore
          status={queue.status}
          onPress={() => queue.loadMore(20)}
          label="Load more requests"
        />
      </ScrollView>
      <StaffBottomNavigation role={role} selected="requests" />
    </SafeAreaView>
  );
}

function ClinicalRequestsScreen() {
  const role = "clinician" as const;
  const account = useStaffAccount(role);
  const [filter, setFilter] = useState<RequestFilter>("submitted");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [schedulingRequestId, setSchedulingRequestId] =
    useState<Id<"careRequests"> | null>(null);
  const counts = useQuery(
    api.careRequests.getClinicalQueueCounts,
    account.state === "ready" ? {} : "skip",
  );
  const queue = usePaginatedQuery(
    api.careRequests.listClinicalQueuePage,
    account.state === "ready" ? { status: filter } : "skip",
    { initialNumItems: 20 },
  );
  const updateStatus = useMutation(api.careRequests.updateClinicalStatus);

  if (account.state !== "ready") {
    return <StaffAccountStateScreen state={account.state} role={role} initialName={account.user?.fullName ?? ""} />;
  }

  const changeStatus = async (
    requestId: Id<"careRequests">,
    status: StaffRequestUpdateStatus,
  ) => {
    setBusyId(String(requestId));
    try {
      await updateStatus({ requestId, status });
    } catch (error) {
      Alert.alert(
        "Could not update request",
        error instanceof Error ? error.message : "Refresh the queue and try again.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const closeRequest = (requestId: Id<"careRequests">) => {
    Alert.alert(
      "Close this request?",
      "Only close after the appropriate follow-up is complete. This action will be recorded.",
      [
        { text: "Keep open", style: "cancel" },
        {
          text: "Close request",
          style: "destructive",
          onPress: () => void changeStatus(requestId, "closed"),
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <QueueHeader role={role} counts={counts} />
        <QueueFilters filter={filter} counts={counts} onChange={setFilter} />
        {schedulingRequestId ? (
          <AppointmentPlanner
            requestId={schedulingRequestId}
            onClose={() => setSchedulingRequestId(null)}
          />
        ) : null}
        {queue.status === "LoadingFirstPage" ? (
          <LoadingQueue label="Loading clinical requests…" />
        ) : queue.results.length === 0 ? (
          <QueueEmpty filter={filter} />
        ) : (
          <View style={styles.requestList}>
            {queue.results.map((request) => (
              <CareRequestCard
                key={request._id}
                request={request}
                staffRole="clinical"
                busy={busyId === String(request._id)}
                onUpdateStatus={(status) => void changeStatus(request._id, status)}
                onCloseRequest={() => closeRequest(request._id)}
                onScheduleAppointment={() => setSchedulingRequestId(request._id)}
              />
            ))}
          </View>
        )}
        <LoadMore
          status={queue.status}
          onPress={() => queue.loadMore(20)}
          label="Load more requests"
        />
      </ScrollView>
      <StaffBottomNavigation role={role} selected="requests" />
    </SafeAreaView>
  );
}

function AdminRequestsScreen() {
  const role = "admin" as const;
  const account = useStaffAccount(role);
  const [requestType, setRequestType] = useState<RequestTypeFilter>("all");
  const [filter, setFilter] = useState<AdminStatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const queue = usePaginatedQuery(
    api.careRequests.listAdminQueuePage,
    account.state === "ready" ? { requestType, status: filter } : "skip",
    { initialNumItems: 20 },
  );
  const team = usePaginatedQuery(
    api.staff.listTeamMembers,
    account.state === "ready" ? { includeInactive: false } : "skip",
    { initialNumItems: 100 },
  );
  const assignRequest = useMutation(api.careRequests.assignAdminRequest);

  if (account.state !== "ready") {
    return <StaffAccountStateScreen state={account.state} role={role} initialName={account.user?.fullName ?? ""} />;
  }

  const assign = async (
    requestId: Id<"careRequests">,
    staffProfileId: Id<"staffProfiles"> | null,
  ) => {
    setBusyId(String(requestId));
    try {
      await assignRequest({ requestId, staffProfileId });
      setExpandedId(null);
    } catch (error) {
      Alert.alert(
        "Could not assign request",
        error instanceof Error ? error.message : "Refresh the queue and try again.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const staffForType = (type: "clinical" | "counselling") =>
    team.results.filter(
      (member) =>
        member.active &&
        member.role === (type === "clinical" ? "clinician" : "counselor"),
    );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.eyebrow}>TRINITY · REQUEST MANAGEMENT</Text>
          <Text style={styles.pageTitle}>All care requests</Text>
          <Text style={styles.pageSubtitle}>
            Review the live request queue and assign each case to an active staff member.
          </Text>
        </View>

        <View style={styles.typeFilterRow}>
          {(["all", "clinical", "counselling"] as const).map((type) => (
            <StaffQueueFilterButton
              key={type}
              selected={requestType === type}
              label={type === "all" ? "All services" : type === "clinical" ? "Clinical" : "Counselling"}
              onPress={() => setRequestType(type)}
            />
          ))}
        </View>
        <View style={styles.filterRow}>
          {(["all", ...requestFilters.map((item) => item.status)] as const).map((status) => (
            <StaffQueueFilterButton
              key={status}
              selected={filter === status}
              label={status === "all" ? "All" : requestFilters.find((item) => item.status === status)?.label ?? status}
              onPress={() => setFilter(status)}
            />
          ))}
        </View>

        {queue.status === "LoadingFirstPage" ? (
          <LoadingQueue label="Loading all care requests…" />
        ) : queue.results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={25} color="#76A17E" />
            <Text style={styles.emptyTitle}>No requests in this view</Text>
            <Text style={styles.emptyBody}>New family requests appear here as they are submitted.</Text>
          </View>
        ) : (
          <View style={styles.requestList}>
            {queue.results.map((request) => {
              const requestStaff = staffForType(request.requestType);
              const expanded = expandedId === String(request._id);
              return (
                <View key={request._id} style={styles.adminRequestCard}>
                  <View style={styles.adminCardHeader}>
                    <View style={styles.requestBadge}>
                      <Ionicons
                        name={request.requestType === "clinical" ? "medkit-outline" : "heart-outline"}
                        size={14}
                        color="#317A48"
                      />
                      <Text style={styles.requestBadgeText}>
                        {request.requestType === "clinical" ? "Clinical" : "Counselling"}
                      </Text>
                    </View>
                    <Text style={styles.statusBadge}>{formatRequestStatus(request.status)}</Text>
                  </View>
                  <Text style={styles.requestId}>Request · {String(request._id).slice(-6).toUpperCase()}</Text>
                  <Text style={styles.requestDate}>Submitted {new Date(request.createdAt).toLocaleString()}</Text>
                  {request.requestSummary ? (
                    <Text style={styles.summaryText}>{request.requestSummary}</Text>
                  ) : (
                    <Text style={styles.noSummary}>No family summary supplied.</Text>
                  )}
                  <View style={styles.assignmentRow}>
                    <View style={styles.assignmentCopy}>
                      <Text style={styles.detailLabel}>Assigned staff</Text>
                      <Text style={styles.assignmentName}>{request.assignedToName ?? "Unassigned"}</Text>
                    </View>
                    {request.status !== "closed" ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setExpandedId(expanded ? null : String(request._id))}
                        style={styles.assignToggle}
                      >
                        <Text style={styles.assignToggleText}>{expanded ? "Done" : "Assign"}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {expanded && request.status !== "closed" ? (
                    <View style={styles.assignmentChoices}>
                      {requestStaff.length === 0 ? (
                        <Text style={styles.noSummary}>
                          Add an active {request.requestType === "clinical" ? "clinician" : "counselor"} in Team first.
                        </Text>
                      ) : (
                        requestStaff.map((member) => (
                          <Pressable
                            key={member._id}
                            accessibilityRole="button"
                            disabled={busyId === String(request._id)}
                            onPress={() => void assign(request._id, member._id)}
                            style={styles.staffChoice}
                          >
                            <Text style={styles.staffChoiceName}>{member.displayName}</Text>
                            <Text style={styles.staffChoiceSpecialty}>{member.specialty}</Text>
                          </Pressable>
                        ))
                      )}
                      {request.assignedToProfileId ? (
                        <Pressable
                          accessibilityRole="button"
                          disabled={busyId === String(request._id)}
                          onPress={() => void assign(request._id, null)}
                          style={styles.unassignButton}
                        >
                          <Text style={styles.unassignText}>Return to unassigned queue</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
        <LoadMore
          status={queue.status}
          onPress={() => queue.loadMore(20)}
          label="Load more requests"
        />
      </ScrollView>
      <StaffBottomNavigation role={role} selected="requests" />
    </SafeAreaView>
  );
}

function QueueHeader({
  role,
  counts,
}: {
  role: "counselor" | "clinician";
  counts:
    | ReturnType<typeof useQuery<typeof api.careRequests.getCounselorQueueCounts>>
    | ReturnType<typeof useQuery<typeof api.careRequests.getClinicalQueueCounts>>;
}) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.eyebrow}>TRINITY · {role === "clinician" ? "CLINICAL" : "COUNSELLING"} QUEUE</Text>
      <Text style={styles.pageTitle}>Care requests</Text>
      <Text style={styles.pageSubtitle}>
        Review family requests, record follow-up, and keep your queue current.
      </Text>
      <View style={styles.metricsRow}>
        <StaffMetricCard label="New" value={counts?.submitted ?? "—"} icon="mail-unread-outline" />
        <StaffMetricCard label="In review" value={counts?.inReview ?? "—"} icon="eye-outline" />
        <StaffMetricCard label="Contacted" value={counts?.contacted ?? "—"} icon="call-outline" />
        <StaffMetricCard label="Closed" value={counts?.closed ?? "—"} icon="checkmark-done-outline" />
      </View>
    </View>
  );
}

function QueueFilters({
  filter,
  counts,
  onChange,
}: {
  filter: RequestFilter;
  counts:
    | ReturnType<typeof useQuery<typeof api.careRequests.getCounselorQueueCounts>>
    | ReturnType<typeof useQuery<typeof api.careRequests.getClinicalQueueCounts>>;
  onChange: (status: RequestFilter) => void;
}) {
  return (
    <View style={styles.filterRow} accessibilityRole="radiogroup">
      {requestFilters.map((item) => (
        <StaffQueueFilterButton
          key={item.status}
          selected={filter === item.status}
          label={`${item.label} (${counts?.[item.status] ?? "—"})`}
          onPress={() => onChange(item.status)}
        />
      ))}
    </View>
  );
}

function QueueEmpty({ filter }: { filter: RequestFilter }) {
  const label = requestFilters.find((item) => item.status === filter)?.label.toLowerCase();
  return (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-done-outline" size={25} color="#76A17E" />
      <Text style={styles.emptyTitle}>No {label} requests</Text>
      <Text style={styles.emptyBody}>This queue updates when families submit or staff update a request.</Text>
    </View>
  );
}

function LoadingQueue({ label }: { label: string }) {
  return (
    <View style={styles.loadingQueue}>
      <ActivityIndicator color="#247640" />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function LoadMore({
  status,
  onPress,
  label,
}: {
  status: string;
  onPress: () => void;
  label: string;
}) {
  if (status !== "CanLoadMore" && status !== "LoadingMore") return null;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={status === "LoadingMore"}
      onPress={onPress}
      style={styles.loadMoreButton}
    >
      {status === "LoadingMore" ? (
        <ActivityIndicator color="#267642" size="small" />
      ) : (
        <Text style={styles.loadMoreText}>{label}</Text>
      )}
    </Pressable>
  );
}

function formatRequestStatus(status: StaffRequestStatus) {
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

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F5F8F5", flex: 1 },
  content: { padding: 16, paddingBottom: 26 },
  pageHeader: { marginBottom: 12 },
  eyebrow: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 9, letterSpacing: 1 },
  pageTitle: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 23, marginTop: 6 },
  pageSubtitle: { color: "#6D7D71", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15, marginTop: 5 },
  metricsRow: { flexDirection: "row", gap: 6, marginTop: 14 },
  filterRow: { backgroundColor: "#EAF0EA", borderRadius: 12, flexDirection: "row", gap: 3, marginTop: 10, padding: 4 },
  typeFilterRow: { backgroundColor: "#EAF0EA", borderRadius: 12, flexDirection: "row", gap: 3, marginTop: 2, padding: 4 },
  requestList: { gap: 10, marginTop: 12 },
  loadingQueue: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 12, minHeight: 88 },
  loadingText: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 9 },
  emptyState: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 15, borderWidth: 1, marginTop: 12, paddingHorizontal: 20, paddingVertical: 25 },
  emptyTitle: { color: "#34523C", fontFamily: "Righteous_400Regular", fontSize: 12, marginTop: 8 },
  emptyBody: { color: "#78877C", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 14, marginTop: 5, textAlign: "center" },
  loadMoreButton: { alignItems: "center", borderColor: "#D4E3D6", borderRadius: 11, borderWidth: 1, justifyContent: "center", marginTop: 12, minHeight: 42 },
  loadMoreText: { color: "#267642", fontFamily: "Righteous_400Regular", fontSize: 9 },
  adminRequestCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 15, borderWidth: 1, padding: 13 },
  adminCardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  requestBadge: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  requestBadgeText: { color: "#357347", fontFamily: "Righteous_400Regular", fontSize: 8 },
  statusBadge: { backgroundColor: "#F1F4F1", borderRadius: 10, color: "#617266", fontFamily: "Righteous_400Regular", fontSize: 8, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  requestId: { color: "#506457", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 9 },
  requestDate: { color: "#879489", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 3 },
  summaryText: { color: "#35483A", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 14, marginTop: 10 },
  noSummary: { color: "#879489", fontFamily: "Righteous_400Regular", fontSize: 8, fontStyle: "italic", marginTop: 10 },
  assignmentRow: { alignItems: "center", borderTopColor: "#EEF2EE", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 10 },
  assignmentCopy: { flex: 1, gap: 4 },
  detailLabel: { color: "#7B897E", fontFamily: "Righteous_400Regular", fontSize: 8 },
  assignmentName: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 10 },
  assignToggle: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 8, justifyContent: "center", minHeight: 32, minWidth: 68, paddingHorizontal: 9 },
  assignToggleText: { color: "#267642", fontFamily: "Righteous_400Regular", fontSize: 8 },
  assignmentChoices: { gap: 6, marginTop: 9 },
  staffChoice: { backgroundColor: "#F7FAF7", borderColor: "#E3ECE4", borderRadius: 9, borderWidth: 1, padding: 9 },
  staffChoiceName: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 9 },
  staffChoiceSpecialty: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 3 },
  unassignButton: { alignItems: "center", justifyContent: "center", minHeight: 35 },
  unassignText: { color: "#A64236", fontFamily: "Righteous_400Regular", fontSize: 8 },
});
