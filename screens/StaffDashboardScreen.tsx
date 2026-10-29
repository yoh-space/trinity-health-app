import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStaffRole } from "../lib/staffRoles";

const requests = [
  {
    id: "REQ-1046",
    title: "Pregnancy & breastfeeding nutrition",
    meta: "New request · Online",
  },
  {
    id: "REQ-1045",
    title: "Family meal planning",
    meta: "Needs a look · In person",
  },
];

export default function StaffDashboardScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = getStaffRole(roleParam);
  if (role.id === "clinician") return <Redirect href="/staff/clinical" />;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{role.deskLabel}</Text>
            <Text style={styles.title}>Good day, Selam.</Text>
            <Text style={styles.subtitle}>
              Selam T. · {role.label} · demo session
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Sign out"
            onPress={() => router.replace("/staff-portal" as Href)}
            style={styles.signOut}
          >
            <Ionicons name="log-out-outline" size={18} color="#396248" />
          </Pressable>
        </View>
        <View style={styles.stats}>
          {[
            ["2", "My open cases", "briefcase-outline"],
            ["1", "Sessions booked", "calendar-outline"],
            ["2", "Need a look", "eye-outline"],
          ].map(([value, label, icon]) => (
            <View key={label} style={styles.stat}>
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color="#4D8B5A"
              />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next session</Text>
          <Text style={styles.sectionLink}>View calendar</Text>
        </View>
        <View style={styles.nextCard}>
          <View style={styles.nextIcon}>
            <Ionicons name="videocam-outline" size={18} color="#2E7B45" />
          </View>
          <View style={styles.nextCopy}>
            <Text style={styles.nextTime}>Thursday · 14:30</Text>
            <Text style={styles.nextTitle}>
              Pregnancy & breastfeeding nutrition
            </Text>
            <Text style={styles.nextMeta}>Online · Family consultation</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#7E8D82" />
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Requests</Text>
          <Text style={styles.sectionLink}>See all</Text>
        </View>
        {requests.map((request, index) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestAvatar}>
              <Ionicons
                name={index === 0 ? "heart-outline" : "restaurant-outline"}
                size={17}
                color="#4A8757"
              />
            </View>
            <View style={styles.requestCopy}>
              <Text style={styles.requestId}>{request.id}</Text>
              <Text style={styles.requestTitle}>{request.title}</Text>
              <Text style={styles.requestMeta}>{request.meta}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#849187" />
          </View>
        ))}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Education toolkit</Text>
          <Text style={styles.sectionLink}>Browse</Text>
        </View>
        <View style={styles.toolkitRow}>
          <ToolkitCard icon="nutrition-outline" title="Family meals" />
          <ToolkitCard icon="book-outline" title="Care notes" />
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        {[
          ["home-outline", "Home"],
          ["list-outline", "Requests"],
          ["people-outline", "Team"],
          ["log-out-outline", "Sign out"],
        ].map(([icon, label], index) => (
          <Pressable
            key={label}
            onPress={() =>
              index === 3 && router.replace("/staff-portal" as Href)
            }
            style={styles.navItem}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={19}
              color={index === 0 ? "#247640" : "#7D8B81"}
            />
            <Text style={[styles.navLabel, index === 0 && styles.navActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function ToolkitCard({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.toolkitCard}>
      <Ionicons name={icon} size={20} color="#4F8B5B" />
      <Text style={styles.toolkitTitle}>{title}</Text>
      <Text style={styles.prepare}>Prepare →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7FAF7", flex: 1 },
  content: { padding: 18, paddingBottom: 30 },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#4A8757",
    fontFamily: "Righteous_400Regular",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: { color: "#203B28", fontFamily: "Righteous_400Regular", fontSize: 25, marginTop: 7 },
  subtitle: {
    color: "#718077",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    marginTop: 5,
  },
  signOut: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE9E0",
    borderRadius: 12,
    borderWidth: 1,
    height: 37,
    justifyContent: "center",
    width: 37,
  },
  stats: { flexDirection: "row", gap: 8, marginTop: 20 },
  stat: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 95,
    padding: 10,
  },
  statValue: {
    color: "#245D37",
    fontFamily: "Righteous_400Regular",
    fontSize: 23,
    marginTop: 6,
  },
  statLabel: {
    color: "#738177",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    lineHeight: 11,
    marginTop: 3,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
    marginTop: 22,
  },
  sectionTitle: { color: "#294433", fontFamily: "Righteous_400Regular", fontSize: 15 },
  sectionLink: { color: "#4B8659", fontFamily: "Righteous_400Regular", fontSize: 9 },
  nextCard: {
    alignItems: "center",
    backgroundColor: "#EAF4EB",
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  nextIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 39,
    justifyContent: "center",
    width: 39,
  },
  nextCopy: { flex: 1 },
  nextTime: { color: "#408050", fontFamily: "Righteous_400Regular", fontSize: 8 },
  nextTitle: {
    color: "#294433",
    fontFamily: "Righteous_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  nextMeta: {
    color: "#728077",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    marginTop: 4,
  },
  requestCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    padding: 11,
  },
  requestAvatar: {
    alignItems: "center",
    backgroundColor: "#EAF4EB",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  requestCopy: { flex: 1 },
  requestId: {
    color: "#579165",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  requestTitle: {
    color: "#2E4434",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    marginTop: 4,
  },
  requestMeta: {
    color: "#7A887D",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    marginTop: 4,
  },
  toolkitRow: { flexDirection: "row", gap: 9 },
  toolkitCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E9E1",
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    minHeight: 105,
    padding: 12,
  },
  toolkitTitle: {
    color: "#2D4635",
    fontFamily: "Righteous_400Regular",
    fontSize: 10,
    marginTop: 12,
  },
  prepare: {
    color: "#4A8757",
    fontFamily: "Righteous_400Regular",
    fontSize: 8,
    marginTop: 12,
  },
  bottomNav: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E1E9E2",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: { alignItems: "center", gap: 3, minWidth: 56 },
  navLabel: { color: "#7D8B81", fontFamily: "Righteous_400Regular", fontSize: 8 },
  navActive: { color: "#247640" },
});
