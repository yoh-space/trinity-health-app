import { type Auth } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getClinicalStaffId({ auth }: { auth: Auth }) {
  const identity = await auth.getUserIdentity();
  if (!identity?.subject) return null;
  const allowedUsers = (process.env.CLINICAL_CLERK_USER_IDS ?? "")
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean);
  return allowedUsers.includes(identity.subject) ? identity.subject : null;
}

async function requireClinicalStaff(ctx: { auth: Auth }) {
  const staffId = await getClinicalStaffId(ctx);
  if (!staffId) {
    throw new Error("Clinical dashboard access is not authorized or configured.");
  }
  return staffId;
}

async function requireUserId({ auth }: { auth: Auth }) {
  const identity = await auth.getUserIdentity();
  if (!identity?.subject) {
    throw new Error("Sign in is required to send a care request.");
  }
  return identity.subject;
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return [];

    const requests = await ctx.db
      .query("careRequests")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", identity.subject),
      )
      .order("desc")
      .take(10);

    return requests.map(
      ({
        _id,
        _creationTime,
        requestType,
        contactMethod,
        contactDetails,
        requestSummary,
        status,
        consentedAt,
        createdAt,
        updatedAt,
      }) => ({
        _id,
        _creationTime,
        requestType,
        contactMethod,
        contactDetails,
        requestSummary,
        status,
        consentedAt,
        createdAt,
        updatedAt,
      }),
    );
  },
});

export const create = mutation({
  args: {
    consent: v.literal(true),
    requestType: v.union(v.literal("clinical"), v.literal("counselling")),
    contactMethod: v.union(v.literal("email"), v.literal("phone")),
    contactDetails: v.string(),
    requestSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const contactDetails = args.contactDetails.trim();
    if (contactDetails.length < 5 || contactDetails.length > 254) {
      throw new Error("Enter a valid email address or phone number.");
    }
    if (args.contactMethod === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails)) {
        throw new Error("Enter a valid email address.");
      }
    } else {
      const digits = contactDetails.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        throw new Error("Enter a valid phone number.");
      }
    }

    const requestSummary = args.requestSummary?.trim();
    if (requestSummary && requestSummary.length > 500) {
      throw new Error("Keep the request summary under 500 characters.");
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("careRequests", {
      userId,
      requestType: args.requestType,
      contactMethod: args.contactMethod,
      contactDetails,
      ...(requestSummary ? { requestSummary } : {}),
      status: "submitted",
      consentedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("careRequestEvents", {
      requestId,
      actorUserId: userId,
      actorRole: "user",
      action: "submitted",
      toStatus: "submitted",
      createdAt: now,
    });
    return requestId;
  },
});

export const listClinicalQueue = query({
  args: {},
  handler: async (ctx) => {
    const staffId = await getClinicalStaffId(ctx);
    if (!staffId) return { authorized: false, requests: [] };

    const [submitted, inReview, contacted] = await Promise.all([
      ctx.db
        .query("careRequests")
        .withIndex("by_type_status_createdAt", (q) =>
          q.eq("requestType", "clinical").eq("status", "submitted"),
        )
        .order("asc")
        .take(100),
      ctx.db
        .query("careRequests")
        .withIndex("by_type_status_createdAt", (q) =>
          q.eq("requestType", "clinical").eq("status", "inReview"),
        )
        .order("asc")
        .take(100),
      ctx.db
        .query("careRequests")
        .withIndex("by_type_status_createdAt", (q) =>
          q.eq("requestType", "clinical").eq("status", "contacted"),
        )
        .order("asc")
        .take(100),
    ]);

    const requests = [...submitted, ...inReview, ...contacted].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    return {
      authorized: true,
      requests: requests.map(
        ({ userId, assignedTo, ...request }) => ({
          ...request,
          assignedToMe: assignedTo === staffId,
          assignedElsewhere: Boolean(assignedTo && assignedTo !== staffId),
        }),
      ),
    };
  },
});

export const updateClinicalStatus = mutation({
  args: {
    requestId: v.id("careRequests"),
    status: v.union(
      v.literal("inReview"),
      v.literal("contacted"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, { requestId, status }) => {
    const staffId = await requireClinicalStaff(ctx);
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("This request no longer exists.");
    if (request.requestType !== "clinical") {
      throw new Error("Clinical staff may only update clinical requests.");
    }
    if (request.assignedTo && request.assignedTo !== staffId) {
      throw new Error("This request is assigned to another clinical staff member.");
    }

    const allowedTransitions: Record<string, string[]> = {
      submitted: ["inReview"],
      inReview: ["contacted"],
      contacted: ["closed"],
      closed: [],
    };
    const claimingUnassigned =
      request.status === "inReview" && status === "inReview" && !request.assignedTo;
    if (
      !claimingUnassigned &&
      !allowedTransitions[request.status]?.includes(status)
    ) {
      throw new Error("That status transition is not allowed.");
    }

    const now = Date.now();
    await ctx.db.patch(requestId, {
      status,
      updatedAt: now,
      ...(status === "inReview" ? { assignedTo: staffId, assignedAt: now } : {}),
    });
    await ctx.db.insert("careRequestEvents", {
      requestId,
      actorUserId: staffId,
      actorRole: "clinical",
      action: claimingUnassigned ? "assigned" : "statusChanged",
      fromStatus: request.status,
      toStatus: status,
      createdAt: now,
    });
  },
});
