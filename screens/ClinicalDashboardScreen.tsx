import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery } from "convex/react";
import { useRouter, type Href } from "expo-router";
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
import { api } from "../convex/_generated/api";
import { type Id } from "../convex/_generated/dataModel";

type QueueFilter = "submitted" | "inReview" | "contacted";
type QueueStatus = "inReview" | "contacted" | "closed";

export default function ClinicalDashboardScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const queue = useQuery(
    api.careRequests.listClinicalQueue,
    isLoaded && isSignedIn ? {} : "skip",
  );
  const updateStatus = useMutation(api.careRequests.updateClinicalStatus);
  const [filter, setFilter] = useState<QueueFilter>("submitted");
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeStatus = async (
    requestId: Id<"careRequests">,
    status: QueueStatus,
  ) => {
    setBusyId(String(requestId));
    try {
      await updateStatus({ requestId, status });
    } catch (error) {
      console.error("Clinical request status update failed.", error);
      Alert.alert(
        "Could not update request",
        "Your change was not saved. Refresh the queue and try again.",
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

  if (!isLoaded) {
    return <AccessState loading title="Loading clinical access…" body="" />;
  }

  if (!isSignedIn) {
    return (
      <AccessState
        icon="lock-closed-outline"
        title="Sign in required"
        body="Clinical requests are available only to authenticated, authorized staff."
        actionLabel="Sign in"
        onAction={() => router.push("/sign-in" as Href)}
      />
    );
  }

  if (queue === undefined) {
    return <AccessState loading title="Loading clinical queue…" body="" />;
  }

  if (!queue.authorized) {
    return (
      <AccessState
        icon="shield-checkmark-outline"
        title="Clinical access not enabled"
        body="This account is not authorized to view clinical requests. Contact your platform administrator if you believe this is an error."
        actionLabel="Back to staff portal"
        onAction={() => router.replace("/staff-portal" as Href)}
      />
    );
  }

  const requests = queue.requests.filter((request) => request.status === filter);
  const newCount = queue.requests.filter((request) => request.status === "submitted").length;
  const reviewCount = queue.requests.filter((request) => request.status === "inReview").length;
  const contactedCount = queue.requests.filter((request) => request.status === "contacted").length;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>TRINITY · CLINICAL</Text>
            <Text style={styles.title}>Clinical review desk</Text>
            <Text style={styles.subtitle}>
              Clinical requests only · access is logged
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to staff portal"
            onPress={() => router.replace("/staff-portal" as Href)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={18} color="#386248" />
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <MetricCard label="New" value={newCount} icon="mail-unread-outline" />
          <MetricCard label="In review" value={reviewCount} icon="eye-outline" />
          <MetricCard
            label="Active total"
            value={newCount + reviewCount + contactedCount}
            icon="clipboard-outline"
          />
        </View>

        <View style={styles.safetyNote}>
          <Ionicons name="lock-closed-outline" size={15} color="#4D7A59" />
          <Text style={styles.safetyText}>
            Review only the information needed to respond. Do not copy request details into unapproved channels or enter diagnoses in this dashboard.
          </Text>
        </View>

        <View style={styles.filterRow} accessibilityRole="radiogroup">
          <FilterButton
            label={`New (${newCount})`}
            selected={filter === "submitted"}
            onPress={() => setFilter("submitted")}
          />
          <FilterButton
            label={`In review (${reviewCount})`}
            selected={filter === "inReview"}
            onPress={() => setFilter("inReview")}
          />
          <FilterButton
            label={`Contacted (${contactedCount})`}
            selected={filter === "contacted"}
            onPress={() => setFilter("contacted")}
          />
        </View>

        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={25} color="#76A17E" />
            <Text style={styles.emptyTitle}>
              {filter === "submitted"
                ? "No new requests"
                : filter === "inReview"
                  ? "No requests in review"
                  : "No contacted requests awaiting closure"}
            </Text>
            <Text style={styles.emptyBody}>
              New clinical requests will appear here after consented submission.
            </Text>
          </View>
        ) : (
          <View style={styles.requestList}>
            {requests.map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.requestBadge}>
                    <Ionicons name="medkit-outline" size={14} color="#317A48" />
                    <Text style={styles.requestBadgeText}>Clinical</Text>
                  </View>
                  <Text style={styles.statusBadge}>
                    {request.status === "submitted"
                      ? "New"
                      : request.status === "inReview"
                        ? "In review"
                        : "Contacted"}
                  </Text>
                </View>

                <Text selectable style={styles.requestId}>
                  {request._id}
                </Text>
                <Text style={styles.requestDate}>
                  Submitted {new Date(request.createdAt).toLocaleString()}
                </Text>

                {request.requestSummary ? (
                  <View style={styles.summaryBox}>
                    <Text style={styles.detailLabel}>User summary</Text>
                    <Text selectable style={styles.summaryText}>
                      {request.requestSummary}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noSummary}>No summary supplied.</Text>
                )}

                <View style={styles.contactBox}>
                  <Ionicons
                    name={request.contactMethod === "email" ? "mail-outline" : "call-outline"}
                    size={15}
                    color="#438451"
                  />
                  <View style={styles.contactCopy}>
                    <Text style={styles.detailLabel}>
                      Preferred contact · {request.contactMethod}
                    </Text>
                    <Text selectable style={styles.contactValue}>
                      {request.contactDetails}
                    </Text>
                  </View>
                </View>

                {request.assignedElsewhere ? (
                  <View style={styles.assignmentNotice}>
                    <Ionicons name="person-outline" size={14} color="#8A6B2C" />
                    <Text style={styles.assignmentText}>
                      Another clinical staff member has claimed this request.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.actions}>
                    {request.status === "submitted" ? (
                      <ActionButton
                        label={busyId === String(request._id) ? "Saving…" : "Start review"}
                        icon="eye-outline"
                        disabled={busyId === String(request._id)}
                        onPress={() => void changeStatus(request._id, "inReview")}
                      />
                    ) : request.status === "inReview" && request.assignedToMe ? (
                      <ActionButton
                        label={busyId === String(request._id) ? "Saving…" : "Mark contacted"}
                        icon="call-outline"
                        disabled={busyId === String(request._id)}
                        onPress={() => void changeStatus(request._id, "contacted")}
                      />
                    ) : request.status === "contacted" && request.assignedToMe ? (
                      <ActionButton
                        label="Close request"
                        icon="checkmark-circle-outline"
                        secondary
                        disabled={busyId === String(request._id)}
                        onPress={() => closeRequest(request._id)}
                      />
                    ) : request.status === "inReview" ? (
                      <ActionButton
                        label="Claim for review"
                        icon="hand-left-outline"
                        disabled={busyId === String(request._id)}
                        onPress={() => void changeStatus(request._id, "inReview")}
                      />
                    ) : request.status === "contacted" ? (
                      <View style={styles.assignmentNotice}>
                        <Ionicons name="person-outline" size={14} color="#8A6B2C" />
                        <Text style={styles.assignmentText}>
                          This request has no recorded assignee. Contact an administrator.
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footerNote}>
          Queue access is limited to the clinical staff allowlist. Status changes are audited; request contents are not copied into the audit log.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function AccessState({
  loading,
  icon = "shield-outline",
  title,
  body,
  actionLabel,
  onAction,
}: {
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.accessState}>
        {loading ? (
          <ActivityIndicator color="#247640" />
        ) : (
          <Ionicons name={icon} size={27} color="#4D7A59" />
        )}
        <Text style={styles.accessTitle}>{title}</Text>
        {!!body && <Text style={styles.accessBody}>{body}</Text>}
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={styles.accessButton}>
            <Text style={styles.accessButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={16} color="#4D8B5A" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function FilterButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.filterButton, selected && styles.filterButtonSelected]}
    >
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  disabled,
  secondary,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary && styles.secondaryAction,
        disabled && styles.actionDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={secondary ? "#4E7057" : "#FFFFFF"}
      />
      <Text style={[styles.actionText, secondary && styles.secondaryActionText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F5F8F5", flex: 1 },
  content: { padding: 16, paddingBottom: 34 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1 },
  eyebrow: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 9, letterSpacing: 1 },
  title: { color: "#1C3524", fontFamily: "Righteous_400Regular", fontSize: 23, marginTop: 6 },
  subtitle: { color: "#6D7D71", fontFamily: "Righteous_400Regular", fontSize: 9, marginTop: 5 },
  backButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DFE8DF", borderRadius: 11, borderWidth: 1, height: 38, justifyContent: "center", width: 38 },
  metricsRow: { flexDirection: "row", gap: 8, marginTop: 17 },
  metricCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 13, borderWidth: 1, flex: 1, minHeight: 78, padding: 9 },
  metricValue: { color: "#245D37", fontFamily: "Righteous_400Regular", fontSize: 20, marginTop: 5 },
  metricLabel: { color: "#738177", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 2 },
  safetyNote: { alignItems: "flex-start", backgroundColor: "#EEF5EF", borderRadius: 11, flexDirection: "row", gap: 8, marginTop: 13, padding: 10 },
  safetyText: { color: "#5A6D5F", flex: 1, fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12 },
  filterRow: { backgroundColor: "#EAF0EA", borderRadius: 12, flexDirection: "row", gap: 5, marginTop: 18, padding: 4 },
  filterButton: { alignItems: "center", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 35, paddingHorizontal: 5 },
  filterButtonSelected: { backgroundColor: "#FFFFFF" },
  filterText: { color: "#728176", fontFamily: "Righteous_400Regular", fontSize: 9 },
  filterTextSelected: { color: "#276B3A" },
  requestList: { gap: 10, marginTop: 12 },
  requestCard: { backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 15, borderWidth: 1, padding: 13 },
  cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  requestBadge: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  requestBadgeText: { color: "#357347", fontFamily: "Righteous_400Regular", fontSize: 8 },
  statusBadge: { backgroundColor: "#F1F4F1", borderRadius: 10, color: "#617266", fontFamily: "Righteous_400Regular", fontSize: 8, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  requestId: { color: "#506457", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 9 },
  requestDate: { color: "#879489", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 3 },
  summaryBox: { backgroundColor: "#F7FAF7", borderRadius: 10, marginTop: 12, padding: 10 },
  detailLabel: { color: "#7B897E", fontFamily: "Righteous_400Regular", fontSize: 8 },
  summaryText: { color: "#35483A", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 15, marginTop: 5 },
  noSummary: { color: "#879489", fontFamily: "Righteous_400Regular", fontSize: 9, fontStyle: "italic", marginTop: 13 },
  contactBox: { alignItems: "center", backgroundColor: "#FAFCFA", borderColor: "#E6ECE6", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 9, marginTop: 10, padding: 9 },
  contactCopy: { flex: 1, gap: 4 },
  contactValue: { color: "#2E4936", fontFamily: "Righteous_400Regular", fontSize: 10 },
  assignmentNotice: { alignItems: "center", backgroundColor: "#FFF7E8", borderRadius: 9, flexDirection: "row", gap: 7, marginTop: 11, padding: 9 },
  assignmentText: { color: "#73591F", flex: 1, fontFamily: "Righteous_400Regular", fontSize: 8 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  actionButton: { alignItems: "center", backgroundColor: "#267642", borderRadius: 10, flexDirection: "row", gap: 6, justifyContent: "center", minHeight: 37, paddingHorizontal: 10 },
  secondaryAction: { backgroundColor: "#F3F8F3", borderColor: "#D4E3D6", borderWidth: 1 },
  actionDisabled: { opacity: 0.5 },
  actionText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 8 },
  secondaryActionText: { color: "#4E7057" },
  emptyState: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 15, borderWidth: 1, marginTop: 12, paddingHorizontal: 20, paddingVertical: 25 },
  emptyTitle: { color: "#34523C", fontFamily: "Righteous_400Regular", fontSize: 12, marginTop: 8 },
  emptyBody: { color: "#78877C", fontFamily: "Righteous_400Regular", fontSize: 9, lineHeight: 14, marginTop: 5, textAlign: "center" },
  footerNote: { color: "#8A968D", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12, marginTop: 18, textAlign: "center" },
  accessState: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  accessTitle: { color: "#244B30", fontFamily: "Righteous_400Regular", fontSize: 17, marginTop: 11, textAlign: "center" },
  accessBody: { color: "#6C7D70", fontFamily: "Righteous_400Regular", fontSize: 10, lineHeight: 16, marginTop: 8, textAlign: "center" },
  accessButton: { alignItems: "center", backgroundColor: "#267642", borderRadius: 11, marginTop: 18, minHeight: 42, justifyContent: "center", paddingHorizontal: 17 },
  accessButtonText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 10 },
});
