import type { Href } from "expo-router";

export type StaffRoleId = "counselor" | "clinician" | "admin";

export type StaffRole = {
  id: StaffRoleId;
  label: string;
  shortLabel: string;
  description: string;
  deskLabel: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
};

export const staffRoles: StaffRole[] = [
  {
    id: "counselor",
    label: "Counselor",
    shortLabel: "Counselor",
    description: "Nutrition & education",
    deskLabel: "COUNSELOR DESK",
    icon: "heart-outline",
  },
  {
    id: "clinician",
    label: "Clinician",
    shortLabel: "Clinician",
    description: "NCD & therapy",
    deskLabel: "CLINICIAN DESK",
    icon: "medkit-outline",
  },
  {
    id: "admin",
    label: "Admin",
    shortLabel: "Admin",
    description: "Queue & team",
    deskLabel: "ADMIN DESK",
    icon: "people-outline",
  },
];

export function getStaffRole(value: string | string[] | undefined): StaffRole {
  const id = Array.isArray(value) ? value[0] : value;
  return staffRoles.find((role) => role.id === id) ?? staffRoles[0];
}

export const staffDashboardPath = (role: StaffRoleId): Href =>
  `/staff-dashboard?role=${role}` as Href;
