import { Ionicons } from "@expo/vector-icons";
import { type Id } from "../../convex/_generated/dataModel";
import { StyleSheet, Text, View } from "react-native";
import { StaffActionButton } from "./StaffDashboardPrimitives";

export type StaffRequestStatus = "submitted" | "inReview" | "contacted";
export type StaffRequestUpdateStatus = "inReview" | "contacted" | "closed";

export type StaffQueueRequest = {
  _id: Id<"careRequests">;
  requestType: "clinical" | "counselling";
  contactMethod: "email" | "phone";
  contactDetails: string;
  requestSummary?: string;
  status: StaffRequestStatus;
  createdAt: number;
  assignedToMe: boolean;
  assignedElsewhere: boolean;
};

export function CareRequestCard({
  request,
  staffRole,
  busy,
  onUpdateStatus,
  onCloseRequest,
}: {
  request: StaffQueueRequest;
  staffRole: "clinical" | "counselor";
  busy: boolean;
  onUpdateStatus: (status: StaffRequestUpdateStatus) => void;
  onCloseRequest: () => void;
}) {
  const label = staffRole === "clinical" ? "Clinical" : "Counselling";
  const icon = staffRole === "clinical" ? "medkit-outline" : "heart-outline";
  const assignedCopy =
    staffRole === "clinical" ? "Another clinical staff member" : "Another counselor";

  return (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.requestBadge}>
          <Ionicons name={icon} size={14} color="#317A48" />
          <Text style={styles.requestBadgeText}>{label}</Text>
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
          <Text style={styles.detailLabel}>Family summary</Text>
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
            {assignedCopy} has claimed this request.
          </Text>
        </View>
      ) : (
        <View style={styles.actions}>
          {request.status === "submitted" ? (
            <StaffActionButton
              label={busy ? "Saving…" : "Start review"}
              icon="eye-outline"
              disabled={busy}
              onPress={() => onUpdateStatus("inReview")}
            />
          ) : request.status === "inReview" && request.assignedToMe ? (
            <StaffActionButton
              label={busy ? "Saving…" : "Mark contacted"}
              icon="call-outline"
              disabled={busy}
              onPress={() => onUpdateStatus("contacted")}
            />
          ) : request.status === "contacted" && request.assignedToMe ? (
            <StaffActionButton
              label={busy ? "Saving…" : "Close request"}
              icon="checkmark-circle-outline"
              secondary
              disabled={busy}
              onPress={onCloseRequest}
            />
          ) : request.status === "inReview" ? (
            <StaffActionButton
              label={busy ? "Saving…" : "Claim for review"}
              icon="hand-left-outline"
              disabled={busy}
              onPress={() => onUpdateStatus("inReview")}
            />
          ) : (
            <View style={styles.assignmentNotice}>
              <Ionicons name="person-outline" size={14} color="#8A6B2C" />
              <Text style={styles.assignmentText}>
                This request has no recorded assignee. Contact an administrator.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
