import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { getStaffRole } from "../lib/staffRoles";

export default function StaffDashboardScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = getStaffRole(roleParam);

  if (role.id === "counselor") return <Redirect href={"/staff/counselor" as Href} />;
  if (role.id === "clinician") return <Redirect href="/staff/clinical" />;
  return <Redirect href={"/staff/admin" as Href} />;
}
