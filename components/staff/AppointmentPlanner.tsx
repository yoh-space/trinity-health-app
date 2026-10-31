import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";
import { type Id } from "../../convex/_generated/dataModel";

const durations = [30, 45, 60] as const;

function parseLocalDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  const parsed = new Date(`${date}T${time}:00`);
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hours ||
    parsed.getMinutes() !== minutes
  ) {
    return null;
  }
  return parsed.getTime();
}

export function AppointmentPlanner({
  requestId,
  onClose,
}: {
  requestId: Id<"careRequests">;
  onClose: () => void;
}) {
  const appointments = useQuery(api.appointments.listAppointmentsForRequest, {
    requestId,
  });
  const schedule = useMutation(api.appointments.scheduleMyAppointment);
  const updateStatus = useMutation(api.appointments.updateAppointmentStatus);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [format, setFormat] = useState<"online" | "inPerson">("online");
  const [busy, setBusy] = useState(false);
  const scheduledAt = parseLocalDateTime(date, time);

  const createAppointment = async () => {
    if (scheduledAt === null) {
      Alert.alert("Check the date and time", "Enter a valid local date and time.");
      return;
    }
    if (scheduledAt <= Date.now()) {
      Alert.alert("Choose a future time", "The session time must be in the future.");
      return;
    }

    setBusy(true);
    try {
      await schedule({ requestId, scheduledAt, durationMinutes, format });
      setDate("");
      setTime("");
      Alert.alert("Session saved", "The scheduled session is now recorded.");
    } catch (error) {
      Alert.alert(
        "Could not schedule session",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const changeAppointmentStatus = async (
    appointmentId: Id<"careAppointments">,
    status: "completed" | "cancelled",
  ) => {
    setBusy(true);
    try {
      await updateStatus({ appointmentId, status });
    } catch (error) {
      Alert.alert(
        "Could not update session",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Session schedule</Text>
          <Text style={styles.subtitle}>Recorded in the care request history.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close session scheduler" onPress={onClose}>
          <Ionicons name="close-circle-outline" size={23} color="#718077" />
        </Pressable>
      </View>

      {appointments === undefined ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#267642" size="small" />
          <Text style={styles.loadingText}>Loading sessions…</Text>
        </View>
      ) : appointments.length > 0 ? (
        <View style={styles.appointmentList}>
          {appointments.map((appointment) => (
            <View key={appointment._id} style={styles.appointmentItem}>
              <View style={styles.appointmentCopy}>
                <Text style={styles.appointmentDate}>
                  {new Date(appointment.scheduledAt).toLocaleString()}
                </Text>
                <Text style={styles.appointmentMeta}>
                  {appointment.durationMinutes} min · {appointment.format === "online" ? "Online" : "In person"}
                </Text>
                <Text style={styles.appointmentStatus}>
                  {appointment.status === "scheduled"
                    ? "Scheduled"
                    : appointment.status === "completed"
                      ? "Completed"
                      : "Cancelled"}
                </Text>
              </View>
              {appointment.status === "scheduled" ? (
                <View style={styles.appointmentActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => void changeAppointmentStatus(appointment._id, "completed")}
                    style={styles.smallAction}
                  >
                    <Text style={styles.smallActionText}>Complete</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => void changeAppointmentStatus(appointment._id, "cancelled")}
                    style={[styles.smallAction, styles.cancelAction]}
                  >
                    <Text style={[styles.smallActionText, styles.cancelText]}>Cancel</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No session has been scheduled for this request.</Text>
      )}

      <Text style={styles.fieldLabel}>Date · local time</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Session date"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          style={styles.input}
          value={date}
        />
        <TextInput
          accessibilityLabel="Session time"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
          onChangeText={setTime}
          placeholder="HH:MM"
          style={styles.timeInput}
          value={time}
        />
      </View>

      <Text style={styles.fieldLabel}>Duration</Text>
      <View style={styles.optionRow}>
        {durations.map((duration) => {
          const selected = duration === durationMinutes;
          return (
            <Pressable
              key={duration}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setDurationMinutes(duration)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {duration} min
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Format</Text>
      <View style={styles.optionRow}>
        {(["online", "inPerson"] as const).map((item) => {
          const selected = item === format;
          return (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setFormat(item)}
              style={[styles.option, styles.formatOption, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {item === "online" ? "Online" : "In person"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy || !date || !time}
        onPress={() => void createAppointment()}
        style={[styles.saveButton, (busy || !date || !time) && styles.disabledButton]}
      >
        {busy ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>
            {appointments?.some((item) => item.status === "scheduled")
              ? "Reschedule session"
              : "Schedule session"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: "#F7FAF7", borderColor: "#DCE9DE", borderRadius: 13, borderWidth: 1, marginTop: 12, padding: 12 },
  panelHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1 },
  title: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 12 },
  subtitle: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12, marginTop: 3 },
  loading: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 14 },
  loadingText: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8 },
  appointmentList: { gap: 7, marginTop: 10 },
  appointmentItem: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3ECE4", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "space-between", padding: 9 },
  appointmentCopy: { flex: 1, gap: 3 },
  appointmentDate: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 9 },
  appointmentMeta: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8 },
  appointmentStatus: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 8 },
  appointmentActions: { gap: 5 },
  smallAction: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 7, justifyContent: "center", minWidth: 58, paddingHorizontal: 7, paddingVertical: 6 },
  smallActionText: { color: "#267642", fontFamily: "Righteous_400Regular", fontSize: 7 },
  cancelAction: { backgroundColor: "#FFF3F1" },
  cancelText: { color: "#B42318" },
  emptyText: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 10 },
  fieldLabel: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 11 },
  inputRow: { flexDirection: "row", gap: 7, marginTop: 5 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#D7E4D8", borderRadius: 8, borderWidth: 1, color: "#243B2A", flex: 1, fontFamily: "Righteous_400Regular", fontSize: 9, minHeight: 38, paddingHorizontal: 9 },
  timeInput: { backgroundColor: "#FFFFFF", borderColor: "#D7E4D8", borderRadius: 8, borderWidth: 1, color: "#243B2A", fontFamily: "Righteous_400Regular", fontSize: 9, minHeight: 38, paddingHorizontal: 9, width: 85 },
  optionRow: { flexDirection: "row", gap: 6, marginTop: 5 },
  option: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#D7E4D8", borderRadius: 8, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 34 },
  formatOption: { minHeight: 36 },
  optionSelected: { backgroundColor: "#EEF7F0", borderColor: "#33804A" },
  optionText: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8 },
  optionTextSelected: { color: "#267642" },
  saveButton: { alignItems: "center", backgroundColor: "#267642", borderRadius: 9, justifyContent: "center", marginTop: 13, minHeight: 40 },
  saveButtonText: { color: "#FFFFFF", fontFamily: "Righteous_400Regular", fontSize: 9 },
  disabledButton: { opacity: 0.55 },
});
