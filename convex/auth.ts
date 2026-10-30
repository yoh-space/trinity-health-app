import type { Auth } from "convex/server";

type AuthenticatedContext = { auth: Auth };
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
