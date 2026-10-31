import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";

type StaffAppointments = FunctionReturnType<typeof api.appointments.listMyAppointments>;

export function StaffUpcomingAppointments({
  appointments,
}: {
  appointments: StaffAppointments | undefined;
}) {
  const now = Date.now();
  const upcoming = appointments?.filter((item) => item.scheduledAt > now) ?? [];
  const next = upcoming[0];

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar-outline" size={18} color="#347447" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>NEXT SESSION</Text>
        {appointments === undefined ? (
          <Text style={styles.detail}>Loading your schedule…</Text>
        ) : next ? (
          <>
            <Text style={styles.date}>{new Date(next.scheduledAt).toLocaleString()}</Text>
            <Text style={styles.detail}>
              {next.requestType === "clinical" ? "Clinical" : "Counselling"}
              {" · "}
              {next.format === "online" ? "Online" : "In person"}
              {" · "}
              {next.durationMinutes} min
            </Text>
            {upcoming.length > 1 ? (
              <Text style={styles.more}>{upcoming.length - 1} more scheduled</Text>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.date}>No session booked</Text>
            <Text style={styles.detail}>Scheduled sessions will appear here.</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E0E9E1", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 13, padding: 12 },
  iconWrap: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 11, height: 38, justifyContent: "center", width: 38 },
  copy: { flex: 1, gap: 3 },
  eyebrow: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 8, letterSpacing: 0.7 },
  date: { color: "#304936", fontFamily: "Righteous_400Regular", fontSize: 10, marginTop: 2 },
  detail: { color: "#718077", fontFamily: "Righteous_400Regular", fontSize: 8, lineHeight: 12 },
  more: { color: "#438451", fontFamily: "Righteous_400Regular", fontSize: 8, marginTop: 2 },
});
