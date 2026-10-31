import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireActiveStaff,
  requireIdentity,
  type StaffRole,
} from "./auth";

const staffRoleValidator = v.union(
  v.literal("counselor"),
  v.literal("clinician"),
  v.literal("admin"),
);
const availabilityValidator = v.union(
  v.literal("available"),
  v.literal("away"),
);
const openRequestCountValidator = v.union(v.number(), v.literal("100+"));

const profileValidator = v.object({
  _id: v.id("staffProfiles"),
  _creationTime: v.number(),
  clerkUserId: v.optional(v.string()),
  role: staffRoleValidator,
  displayName: v.string(),
  specialty: v.string(),
  availability: availabilityValidator,
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
const teamMemberValidator = v.object({
  _id: v.id("staffProfiles"),
  _creationTime: v.number(),
  clerkUserId: v.optional(v.string()),
  role: staffRoleValidator,
  displayName: v.string(),
  specialty: v.string(),
  availability: availabilityValidator,
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
  openRequestCount: openRequestCountValidator,
});

const staffRoles: readonly StaffRole[] = ["counselor", "clinician", "admin"];

function getStaffRole(role: unknown): StaffRole {
  if (typeof role === "string" && staffRoles.includes(role as StaffRole)) {
    return role as StaffRole;
  }
  throw new Error("This account does not have an authorized staff role.");
}

function normalizeProfileText(value: string, label: string, maxLength: number) {
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) {
    throw new Error(`${label} must be between 1 and ${maxLength} characters.`);
  }
  return normalized;
}

export const getMyProfile = query({
  args: {},
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("staffProfiles")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject),
      )
      .unique();
    if (!profile) return null;

    return {
      _id: profile._id,
      _creationTime: profile._creationTime,
      ...(identity.role === "admin" ? { clerkUserId: profile.clerkUserId } : {}),
      role: profile.role,
      displayName: profile.displayName,
      specialty: profile.specialty,
      availability: profile.availability,
      active: profile.active,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  },
});

/**
 * Creates a directory record for the signed-in staff account on first use.
 * The role is always derived from the verified Clerk JWT claim.
 */
export const ensureMyProfile = mutation({
  args: {
    displayName: v.string(),
    specialty: v.string(),
  },
  returns: v.id("staffProfiles"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const role = getStaffRole(identity.role);
    const displayName = normalizeProfileText(args.displayName, "Name", 80);
    const specialty = normalizeProfileText(args.specialty, "Specialty", 100);
    const existing = await ctx.db
      .query("staffProfiles")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject),
      )
      .unique();

    if (existing) {
      if (existing.role !== role) {
        throw new Error(
          "Your Clerk role does not match the staff directory. Ask an administrator to correct it.",
        );
      }
      if (!existing.active) {
        throw new Error(
          "Your staff access is inactive. Ask an administrator to restore it.",
        );
      }
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("staffProfiles", {
      clerkUserId: identity.subject,
      role,
      displayName,
      specialty,
      availability: "available",
      active: true,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listTeamMembers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    includeInactive: v.optional(v.boolean()),
  },
  returns: paginationResultValidator(teamMemberValidator),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const role = getStaffRole(identity.role);
    await requireActiveStaff(ctx, role);
    const includeInactive = args.includeInactive === true && role === "admin";

    const page = includeInactive
      ? await ctx.db
          .query("staffProfiles")
          .withIndex("by_updatedAt")
          .order("desc")
          .paginate(args.paginationOpts)
      : await ctx.db
          .query("staffProfiles")
          .withIndex("by_active_updatedAt", (q) => q.eq("active", true))
          .order("desc")
          .paginate(args.paginationOpts);

    return {
      ...page,
      page: await Promise.all(
        page.page.map(async (profile) => {
          const openRequestRows = await Promise.all(
            (["submitted", "inReview", "contacted"] as const).map((status) =>
              ctx.db
                .query("careRequests")
                .withIndex("by_assignedTo_status_createdAt", (q) =>
                  q.eq("assignedTo", profile.clerkUserId).eq("status", status),
                )
                .take(101),
            ),
          );
          const totalOpenRequests = openRequestRows.reduce(
            (total, requests) => total + requests.length,
            0,
          );
          const openRequestCount: number | "100+" =
            totalOpenRequests > 100 ? "100+" : totalOpenRequests;

          return {
            _id: profile._id,
            _creationTime: profile._creationTime,
            ...(role === "admin" ? { clerkUserId: profile.clerkUserId } : {}),
            role: profile.role,
            displayName: profile.displayName,
            specialty: profile.specialty,
            availability: profile.availability,
            active: profile.active,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            openRequestCount,
          };
        }),
      ),
    };
  },
});

export const createTeamMember = mutation({
  args: {
    clerkUserId: v.string(),
    role: staffRoleValidator,
    displayName: v.string(),
    specialty: v.string(),
  },
  returns: v.id("staffProfiles"),
  handler: async (ctx, args) => {
    const admin = await requireActiveStaff(ctx, "admin");
    const clerkUserId = normalizeProfileText(args.clerkUserId, "Clerk user ID", 255);
    const displayName = normalizeProfileText(args.displayName, "Name", 80);
    const specialty = normalizeProfileText(args.specialty, "Specialty", 100);
    const existing = await ctx.db
      .query("staffProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (existing) {
      throw new Error("This Clerk user already has a staff directory profile.");
    }

    const now = Date.now();
    return await ctx.db.insert("staffProfiles", {
      clerkUserId,
      role: args.role,
      displayName,
      specialty,
      availability: "available",
      active: true,
      createdBy: admin.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTeamMember = mutation({
  args: {
    profileId: v.id("staffProfiles"),
    displayName: v.string(),
    specialty: v.string(),
    active: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireActiveStaff(ctx, "admin");
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("This staff profile no longer exists.");
    if (profile.clerkUserId === admin.subject && !args.active) {
      throw new Error("You cannot deactivate your own admin profile.");
    }
    if (profile.active && !args.active) {
      const openRequests = await Promise.all(
        (["submitted", "inReview", "contacted"] as const).map((status) =>
          ctx.db
            .query("careRequests")
            .withIndex("by_assignedTo_status_createdAt", (q) =>
              q.eq("assignedTo", profile.clerkUserId).eq("status", status),
            )
            .take(1),
        ),
      );
      const scheduledAppointments = await ctx.db
        .query("careAppointments")
        .withIndex("by_staffUserId_status_scheduledAt", (q) =>
          q.eq("staffUserId", profile.clerkUserId).eq("status", "scheduled"),
        )
        .take(1);
      if (
        openRequests.some((requests) => requests.length > 0) ||
        scheduledAppointments.length > 0
      ) {
        throw new Error(
          "Reassign open requests and resolve scheduled sessions before deactivating the profile.",
        );
      }
    }

    await ctx.db.patch(args.profileId, {
      displayName: normalizeProfileText(args.displayName, "Name", 80),
      specialty: normalizeProfileText(args.specialty, "Specialty", 100),
      active: args.active,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const updateMyAvailability = mutation({
  args: { availability: availabilityValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required.");
    const role = getStaffRole(identity.role);
    await requireActiveStaff(ctx, role);
    const profile = await ctx.db
      .query("staffProfiles")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject),
      )
      .unique();
    if (!profile) throw new Error("Your staff profile is missing.");

    await ctx.db.patch(profile._id, {
      availability: args.availability,
      updatedAt: Date.now(),
    });
    return null;
  },
});

