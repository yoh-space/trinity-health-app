import { Ionicons } from "@expo/vector-icons";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
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
import {
  CareRequestCard,
  type StaffRequestUpdateStatus,
} from "../components/staff/CareRequestCard";
import {
  StaffMetricCard,
  StaffQueueFilterButton,
} from "../components/staff/StaffDashboardPrimitives";
import {
  StaffAccountStateScreen,
  StaffBottomNavigation,
} from "../components/staff/StaffDashboardNavigation";
import { StaffUpcomingAppointments } from "../components/staff/StaffUpcomingAppointments";
import { useStaffAccount } from "../hooks/useStaffAccount";

type QueueFilter = "submitted" | "inReview" | "contacted";

const filters: { status: QueueFilter; label: string }[] = [
  { status: "submitted", label: "New" },
  { status: "inReview", label: "In review" },
  { status: "contacted", label: "Contacted" },
];

export default function ClinicalDashboardScreen() {
  const router = useRouter();
  const { state: staffAccountState, user, profile } = useStaffAccount("clinician");
  const [filter, setFilter] = useState<QueueFilter>("submitted");
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useQuery(
    api.careRequests.getClinicalQueueCounts,
    staffAccountState === "ready" ? {} : "skip",
  );
  const queue = usePaginatedQuery(
    api.careRequests.listClinicalQueuePage,
    staffAccountState === "ready" ? { status: filter } : "skip",
    { initialNumItems: 20 },
  );
  const resources = useQuery(
    api.education.listPublished,
    staffAccountState === "ready" ? {} : "skip",
  );
  const appointments = useQuery(
    api.appointments.listMyAppointments,
    staffAccountState === "ready" ? {} : "skip",
  );
  const updateStatus = useMutation(api.careRequests.updateClinicalStatus);

  const changeStatus = async (
    requestId: Id<"careRequests">,
    status: StaffRequestUpdateStatus,
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

  if (staffAccountState !== "ready") {
    return (
      <StaffAccountStateScreen
        state={staffAccountState}
        role="clinician"
        initialName={user?.fullName ?? ""}
      />
    );
  }

  const displayName = profile?.displayName.trim().split(/\s+/)[0] || user?.firstName?.trim() || "Clinician";
  const isLoadingQueue = queue.status === "LoadingFirstPage";
  const isLoadingMore = queue.status === "LoadingMore";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>TRINITY · CLINICIAN DESK</Text>
            <Text style={styles.title}>Hello, {displayName}.</Text>
            <Text style={styles.subtitle}>
              Review clinical requests and support families with appropriate care.
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <StaffMetricCard
            label="New requests"
            value={counts?.submitted ?? "—"}
            icon="mail-unread-outline"
          />
          <StaffMetricCard
            label="In review"
            value={counts?.inReview ?? "—"}
            icon="eye-outline"
          />
          <StaffMetricCard
            label="Contacted"
            value={counts?.contacted ?? "—"}
            icon="call-outline"
          />
        </View>

        <StaffUpcomingAppointments appointments={appointments} />

        <View style={styles.scopeNote}>
          <Ionicons name="medkit-outline" size={16} color="#4D7A59" />
          <View style={styles.scopeCopy}>
            <Text style={styles.scopeTitle}>Care scope</Text>
            <Text style={styles.scopeText}>
              Use this queue for follow-up on submitted requests. For urgent warning signs, direct families to the nearest health facility.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Clinical requests</Text>
            <Text style={styles.sectionSubtitle}>
              Submitted by families requesting clinical support
            </Text>
          </View>
        </View>

        <View style={styles.filterRow} accessibilityRole="radiogroup">
          {filters.map((item) => (
            <StaffQueueFilterButton
              key={item.status}
              label={`${item.label} (${counts?.[item.status] ?? "—"})`}
              selected={filter === item.status}
              onPress={() => setFilter(item.status)}
            />
          ))}
        </View>

        {isLoadingQueue ? (
          <View style={styles.loadingQueue}>
            <ActivityIndicator color="#247640" />
            <Text style={styles.loadingText}>Loading clinical requests…</Text>
          </View>
        ) : queue.results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-outline"
              size={25}
              color="#76A17E"
            />
            <Text style={styles.emptyTitle}>
              {filter === "submitted"
                ? "No new requests"
                : filter === "inReview"
                  ? "No requests in review"
                  : "No contacted requests awaiting closure"}
            </Text>
            <Text style={styles.emptyBody}>
              The queue updates when families submit a clinical request.
            </Text>
          </View>
        ) : (
          <View style={styles.requestList}>
            {queue.results.map((request) => (
              <CareRequestCard
                key={request._id}
                request={request}
                staffRole="clinical"
                busy={busyId === String(request._id)}
                onUpdateStatus={(status) =>
                  void changeStatus(request._id, status)
                }
                onCloseRequest={() => closeRequest(request._id)}
              />
            ))}
          </View>
        )}

        {queue.status === "CanLoadMore" || queue.status === "LoadingMore" ? (
          <Pressable
            accessibilityRole="button"
            disabled={isLoadingMore}
            onPress={() => queue.loadMore(20)}
            style={styles.loadMoreButton}
          >
            {isLoadingMore ? (
              <ActivityIndicator color="#267642" size="small" />
            ) : (
              <Text style={styles.loadMoreText}>Load more requests</Text>
            )}
          </Pressable>
        ) : null}

        <View style={styles.toolkitSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Education toolkit</Text>
              <Text style={styles.sectionSubtitle}>
                Published Trinity resources for family learning
              </Text>
            </View>
          </View>

          {resources === undefined ? (
            <View style={styles.resourcesLoading}>
              <ActivityIndicator color="#247640" size="small" />
            </View>
          ) : resources.length === 0 ? (
            <View style={styles.resourcesEmpty}>
              <Text style={styles.emptyBody}>
                No published education resources are available yet.
              </Text>
            </View>
          ) : (
            resources.slice(0, 3).map((resource) => (
              <Pressable
                key={resource._id}
                accessibilityRole="button"
                onPress={() =>
                  router.push(
                    `/public/article/${encodeURIComponent(String(resource._id))}` as Href,
                  )
                }
                style={styles.resourceCard}
              >
                <View style={styles.resourceIcon}>
                  <Ionicons name="book-outline" size={18} color="#347447" />
                </View>
                <View style={styles.resourceCopy}>
                  <Text style={styles.resourceCategory}>{resource.category}</Text>
                  <Text numberOfLines={2} style={styles.resourceTitle}>
                    {resource.title}
                  </Text>
                  <Text style={styles.resourceReadTime}>
                    {resource.readMinutes} min read
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#849187" />
              </Pressable>
            ))
          )}
        </View>

        <Text style={styles.footerNote}>
          Clinician access is restricted by the Clerk role claim. Request content is excluded from the audit log.
        </Text>
      </ScrollView>
      <StaffBottomNavigation role="clinician" selected="home" />
    </SafeAreaView>
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
  metricsRow: { flexDirection: "row", gap: 8, marginTop: 17 },
  scopeNote: {
    alignItems: "flex-start",
    backgroundColor: "#EEF5EF",
    borderRadius: 11,
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
    padding: 11,
  },
  scopeCopy: { flex: 1, gap: 3 },
  scopeTitle: {
    color: "#386248",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
  },
  scopeText: {
    color: "#5A6D5F",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    lineHeight: 14,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  filterRow: {
    backgroundColor: "#EAF0EA",
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    marginTop: 12,
    padding: 4,
  },
  loadingQueue: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 88,
  },
  loadingText: {
    color: "#6D7D71",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
  },
  requestList: { gap: 10, marginTop: 12 },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 12,
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
  loadMoreButton: {
    alignItems: "center",
    borderColor: "#D5E5D7",
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 42,
  },
  loadMoreText: {
    color: "#267642",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
  },
  toolkitSection: { marginTop: 4 },
  resourcesLoading: { alignItems: "center", paddingVertical: 20 },
  resourcesEmpty: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 12,
    padding: 18,
  },
  resourceCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    padding: 12,
  },
  resourceIcon: {
    alignItems: "center",
    backgroundColor: "#EEF7F0",
    borderRadius: 11,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  resourceCopy: { flex: 1, gap: 3 },
  resourceCategory: {
    color: "#438451",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  resourceTitle: {
    color: "#304936",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  resourceReadTime: {
    color: "#7B897E",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
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
