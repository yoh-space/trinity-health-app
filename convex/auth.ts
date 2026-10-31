import type { Auth } from "convex/server";
import type { QueryCtx } from "./_generated/server";

type AuthenticatedContext = { auth: Auth };
type StaffDatabaseContext = { auth: Auth; db: QueryCtx["db"] };
export type StaffRole = "counselor" | "clinician" | "admin";

export const requireIdentity = async (ctx: AuthenticatedContext) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required.");
  return identity;
};

export const getIdentityForRole = async (
  ctx: AuthenticatedContext,
  role: StaffRole,
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.role !== role) return null;
  return identity;
};

export const requireRole = async (
  ctx: AuthenticatedContext,
  role: StaffRole,
) => {
  const identity = await requireIdentity(ctx);
  if (identity.role !== role) {
    throw new Error(`${role} access required.`);
  }
  return identity;
};

export const requireAdmin = async (ctx: AuthenticatedContext) =>
  await requireRole(ctx, "admin");

export const getActiveStaffIdentity = async (
  ctx: StaffDatabaseContext,
  role: StaffRole,
) => {
  const identity = await getIdentityForRole(ctx, role);
  if (!identity) return null;

  const profile = await ctx.db
    .query("staffProfiles")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  return profile?.active && profile.role === role ? identity : null;
};

export const requireActiveStaff = async (
  ctx: StaffDatabaseContext,
  role: StaffRole,
) => {
  const identity = await requireRole(ctx, role);
  const profile = await ctx.db
    .query("staffProfiles")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!profile || !profile.active || profile.role !== role) {
    throw new Error("An active staff directory profile is required.");
  }

  return identity;
};
