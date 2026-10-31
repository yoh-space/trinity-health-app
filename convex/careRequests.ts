import {
  type Auth,
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { type Doc, type Id } from "./_generated/dataModel";
import { getActiveStaffIdentity, requireActiveStaff } from "./auth";

const requestTypeValidator = v.union(
  v.literal("clinical"),
  v.literal("counselling"),
);
const contactMethodValidator = v.union(v.literal("email"), v.literal("phone"));
const requestStatusValidator = v.union(
  v.literal("submitted"),
  v.literal("inReview"),
  v.literal("contacted"),
  v.literal("closed"),
);
const adminQueueStatusValidator = v.union(
  v.literal("all"),
  v.literal("submitted"),
  v.literal("inReview"),
  v.literal("contacted"),
  v.literal("closed"),
);
const adminQueueTypeValidator = v.union(
  v.literal("all"),
  v.literal("clinical"),
  v.literal("counselling"),
);
const staffUpdateStatusValidator = v.union(
  v.literal("inReview"),
  v.literal("contacted"),
  v.literal("closed"),
);

const myRequestValidator = v.object({
  _id: v.id("careRequests"),
  _creationTime: v.number(),
  requestType: requestTypeValidator,
  contactMethod: contactMethodValidator,
  contactDetails: v.string(),
  requestSummary: v.optional(v.string()),
  status: requestStatusValidator,
  consentedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const clinicalQueueItemValidator = v.object({
  _id: v.id("careRequests"),
  _creationTime: v.number(),
  requestType: v.literal("clinical"),
  contactMethod: contactMethodValidator,
  contactDetails: v.string(),
  requestSummary: v.optional(v.string()),
  assignedAt: v.optional(v.number()),
  status: requestStatusValidator,
  consentedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  assignedToMe: v.boolean(),
  assignedElsewhere: v.boolean(),
});

const counselorQueueItemValidator = v.object({
  _id: v.id("careRequests"),
  _creationTime: v.number(),
  requestType: v.literal("counselling"),
  contactMethod: contactMethodValidator,
  contactDetails: v.string(),
  requestSummary: v.optional(v.string()),
  assignedAt: v.optional(v.number()),
  status: requestStatusValidator,
  consentedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  assignedToMe: v.boolean(),
  assignedElsewhere: v.boolean(),
});

const counselorQueueCountsValidator = v.union(v.number(), v.literal("100+"));
const clinicalQueueCountsValidator = v.union(v.number(), v.literal("100+"));
const adminBoundedCountValidator = v.union(v.number(), v.literal("100+"));
const adminStatusCountsValidator = v.object({
  submitted: adminBoundedCountValidator,
  inReview: adminBoundedCountValidator,
  contacted: adminBoundedCountValidator,
  closed: adminBoundedCountValidator,
});
const adminRecentRequestValidator = v.object({
  _id: v.id("careRequests"),
  requestType: requestTypeValidator,
  status: requestStatusValidator,
  createdAt: v.number(),
  assigned: v.boolean(),
});
const adminQueueItemValidator = v.object({
  _id: v.id("careRequests"),
  _creationTime: v.number(),
  requestType: requestTypeValidator,
  contactMethod: contactMethodValidator,
  contactDetails: v.string(),
  requestSummary: v.optional(v.string()),
  status: requestStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
  assignedToProfileId: v.optional(v.id("staffProfiles")),
  assignedToName: v.optional(v.string()),
});

type StaffRequestType = "clinical" | "counselling";
type StaffActorRole = "clinical" | "counselor";
type StaffUpdateStatus = "inReview" | "contacted" | "closed";
type RequestStatus = "submitted" | "inReview" | "contacted" | "closed";

const adminRequestTypes = ["clinical", "counselling"] as const;
const adminRequestStatuses = ["submitted", "inReview", "contacted", "closed"] as const;

async function getClinicalStaffId(ctx: {
  auth: Auth;
  db: QueryCtx["db"];
}) {
  const identity = await getActiveStaffIdentity(ctx, "clinician");
  return identity?.subject ?? null;
}

async function getCounselorStaffId(ctx: {
  auth: Auth;
  db: QueryCtx["db"];
}) {
  const identity = await getActiveStaffIdentity(ctx, "counselor");
  return identity?.subject ?? null;
}

async function requireClinicalStaff(ctx: {
  auth: Auth;
  db: QueryCtx["db"];
}) {
  return (await requireActiveStaff(ctx, "clinician")).subject;
}

async function requireCounselorStaff(ctx: {
  auth: Auth;
  db: QueryCtx["db"];
}) {
  return (await requireActiveStaff(ctx, "counselor")).subject;
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
  returns: v.array(myRequestValidator),
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
  returns: v.id("careRequests"),
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
  returns: v.object({
    authorized: v.boolean(),
    requests: v.array(clinicalQueueItemValidator),
  }),
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
          requestType: "clinical" as const,
          status: request.status as RequestStatus,
          assignedToMe: assignedTo === staffId,
          assignedElsewhere: Boolean(assignedTo && assignedTo !== staffId),
        }),
      ),
    };
  },
});

export const getClinicalAccess = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => Boolean(await getClinicalStaffId(ctx)),
});

export const getClinicalQueueCounts = query({
  args: {},
  returns: v.object({
    submitted: clinicalQueueCountsValidator,
    inReview: clinicalQueueCountsValidator,
    contacted: clinicalQueueCountsValidator,
    closed: clinicalQueueCountsValidator,
  }),
  handler: async (ctx) => {
    await requireClinicalStaff(ctx);
    const statuses = ["submitted", "inReview", "contacted", "closed"] as const;
    const rows = await Promise.all(
      statuses.map((status) =>
        ctx.db
          .query("careRequests")
          .withIndex("by_type_status_createdAt", (q) =>
            q.eq("requestType", "clinical").eq("status", status),
          )
          .take(101),
      ),
    );
    const count = (items: readonly unknown[]): number | "100+" =>
      items.length > 100 ? "100+" : items.length;
    return {
      submitted: count(rows[0]),
      inReview: count(rows[1]),
      contacted: count(rows[2]),
      closed: count(rows[3]),
    };
  },
});

export const listClinicalQueuePage = query({
  args: {
    status: requestStatusValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(clinicalQueueItemValidator),
  handler: async (ctx, { status, paginationOpts }) => {
    const staffId = await requireClinicalStaff(ctx);
    const page = await ctx.db
      .query("careRequests")
      .withIndex("by_type_status_createdAt", (q) =>
        q.eq("requestType", "clinical").eq("status", status),
      )
      .order("desc")
      .paginate(paginationOpts);

    return {
      ...page,
      page: page.page.map(({ userId, assignedTo, ...request }) => ({
        ...request,
        requestType: "clinical" as const,
        status,
        assignedToMe: assignedTo === staffId,
        assignedElsewhere: Boolean(assignedTo && assignedTo !== staffId),
      })),
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
  returns: v.null(),
  handler: async (ctx, { requestId, status }) => {
    const staffId = await requireClinicalStaff(ctx);
    return await updateStaffRequestStatus(ctx, {
      requestId,
      status,
      requestType: "clinical",
      staffId,
      actorRole: "clinical",
    });
  },
});

export const getCounselorAccess = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => Boolean(await getCounselorStaffId(ctx)),
});

export const getCounselorQueueCounts = query({
  args: {},
  returns: v.object({
    submitted: counselorQueueCountsValidator,
    inReview: counselorQueueCountsValidator,
    contacted: counselorQueueCountsValidator,
    closed: counselorQueueCountsValidator,
  }),
  handler: async (ctx) => {
    await requireCounselorStaff(ctx);
    const statuses = ["submitted", "inReview", "contacted", "closed"] as const;
    const rows = await Promise.all(
      statuses.map((status) =>
        ctx.db
          .query("careRequests")
          .withIndex("by_type_status_createdAt", (q) =>
            q.eq("requestType", "counselling").eq("status", status),
          )
          .take(101),
      ),
    );
    const count = (items: readonly unknown[]): number | "100+" =>
      items.length > 100 ? "100+" : items.length;
    return {
      submitted: count(rows[0]),
      inReview: count(rows[1]),
      contacted: count(rows[2]),
      closed: count(rows[3]),
    };
  },
});

export const listCounselorQueue = query({
  args: {
    status: requestStatusValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(counselorQueueItemValidator),
  handler: async (ctx, { status, paginationOpts }) => {
    const staffId = await requireCounselorStaff(ctx);
    const page = await ctx.db
      .query("careRequests")
      .withIndex("by_type_status_createdAt", (q) =>
        q.eq("requestType", "counselling").eq("status", status),
      )
      .order("desc")
      .paginate(paginationOpts);

    return {
      ...page,
      page: page.page.map(({ userId, assignedTo, ...request }) => ({
        ...request,
        requestType: "counselling" as const,
        status,
        assignedToMe: assignedTo === staffId,
        assignedElsewhere: Boolean(assignedTo && assignedTo !== staffId),
      })),
    };
  },
});

export const updateCounselorStatus = mutation({
  args: {
    requestId: v.id("careRequests"),
    status: staffUpdateStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, { requestId, status }) => {
    const staffId = await requireCounselorStaff(ctx);
    return await updateStaffRequestStatus(ctx, {
      requestId,
      status,
      requestType: "counselling",
      staffId,
      actorRole: "counselor",
    });
  },
});

export const getAdminDashboardOverview = query({
  args: {},
  returns: v.object({
    counts: v.object({
      clinical: adminStatusCountsValidator,
      counselling: adminStatusCountsValidator,
    }),
    recentRequests: v.array(adminRecentRequestValidator),
  }),
  handler: async (ctx) => {
    await requireActiveStaff(ctx, "admin");

    const buckets = await Promise.all(
      adminRequestTypes.flatMap((requestType) =>
        adminRequestStatuses.map(async (status) => ({
          requestType,
          status,
          documents: await ctx.db
            .query("careRequests")
            .withIndex("by_type_status_createdAt", (q) =>
              q.eq("requestType", requestType).eq("status", status),
            )
            .order("desc")
            .take(101),
        })),
      ),
    );

    const bucketMap = new Map<string, Doc<"careRequests">[]>();
    for (const bucket of buckets) {
      bucketMap.set(`${bucket.requestType}:${bucket.status}`, bucket.documents);
    }

    const countBucket = (
      requestType: (typeof adminRequestTypes)[number],
      status: (typeof adminRequestStatuses)[number],
    ): number | "100+" => {
      const count = bucketMap.get(`${requestType}:${status}`)?.length ?? 0;
      return count > 100 ? "100+" : count;
    };

    const recentRequests = buckets
      .flatMap((bucket) => bucket.documents)
      .sort((left, right) => {
        const bySubmittedAt = right.createdAt - left.createdAt;
        return bySubmittedAt || right._creationTime - left._creationTime;
      })
      .slice(0, 10)
      .map((request) => ({
        _id: request._id,
        requestType: request.requestType,
        status: request.status,
        createdAt: request.createdAt,
        assigned: Boolean(request.assignedTo),
      }));

    return {
      counts: {
        clinical: {
          submitted: countBucket("clinical", "submitted"),
          inReview: countBucket("clinical", "inReview"),
          contacted: countBucket("clinical", "contacted"),
          closed: countBucket("clinical", "closed"),
        },
        counselling: {
          submitted: countBucket("counselling", "submitted"),
          inReview: countBucket("counselling", "inReview"),
          contacted: countBucket("counselling", "contacted"),
          closed: countBucket("counselling", "closed"),
        },
      },
      recentRequests,
    };
  },
});

export const listAdminQueuePage = query({
  args: {
    requestType: adminQueueTypeValidator,
    status: adminQueueStatusValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(adminQueueItemValidator),
  handler: async (ctx, args) => {
    await requireActiveStaff(ctx, "admin");
    const requestType = args.requestType === "all" ? null : args.requestType;
    const status = args.status === "all" ? null : args.status;

    const page = await (async () => {
      if (requestType && status) {
        return await ctx.db
          .query("careRequests")
          .withIndex("by_type_status_createdAt", (q) =>
            q.eq("requestType", requestType).eq("status", status),
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }
      if (requestType) {
        return await ctx.db
          .query("careRequests")
          .withIndex("by_type_createdAt", (q) =>
            q.eq("requestType", requestType),
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }
      if (status) {
        return await ctx.db
          .query("careRequests")
          .withIndex("by_status_createdAt", (q) =>
            q.eq("status", status),
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }
      return await ctx.db
        .query("careRequests")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate(args.paginationOpts);
    })();

    return {
      ...page,
      page: await Promise.all(
        page.page.map(async ({ userId, assignedTo, ...request }) => {
          const assignedProfile = assignedTo
            ? await ctx.db
                .query("staffProfiles")
                .withIndex("by_clerkUserId", (q) =>
                  q.eq("clerkUserId", assignedTo),
                )
                .unique()
            : null;
          return {
            ...request,
            ...(assignedProfile
              ? {
                  assignedToProfileId: assignedProfile._id,
                  assignedToName: assignedProfile.displayName,
                }
              : {}),
          };
        }),
      ),
    };
  },
});

export const assignAdminRequest = mutation({
  args: {
    requestId: v.id("careRequests"),
    staffProfileId: v.union(v.id("staffProfiles"), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, { requestId, staffProfileId }) => {
    const admin = await requireActiveStaff(ctx, "admin");
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("This request no longer exists.");
    if (request.status === "closed") {
      throw new Error("Closed requests cannot be assigned.");
    }

    const scheduledAppointments = await ctx.db
      .query("careAppointments")
      .withIndex("by_requestId_status_scheduledAt", (q) =>
        q.eq("requestId", requestId).eq("status", "scheduled"),
      )
      .take(1);

    const profile = staffProfileId ? await ctx.db.get(staffProfileId) : null;
    if (staffProfileId && !profile) {
      throw new Error("This staff profile no longer exists.");
    }
    if (profile) {
      if (!profile.active) {
        throw new Error("Choose an active staff member.");
      }
      const requiredRole =
        request.requestType === "clinical" ? "clinician" : "counselor";
      if (profile.role !== requiredRole) {
        throw new Error(
          `Choose a ${requiredRole === "clinician" ? "clinician" : "counselor"} for this request.`,
        );
      }
      if (
        scheduledAppointments[0] &&
        scheduledAppointments[0].staffUserId !== profile.clerkUserId
      ) {
        throw new Error(
          "Cancel or complete the existing session before reassigning this request.",
        );
      }

      const now = Date.now();
      await ctx.db.patch(requestId, {
        assignedTo: profile.clerkUserId,
        assignedAt: now,
        status: "inReview",
        updatedAt: now,
      });
      await ctx.db.insert("careRequestEvents", {
        requestId,
        actorUserId: admin.subject,
        actorRole: "admin",
        action: "assigned",
        fromStatus: request.status,
        toStatus: "inReview",
        createdAt: now,
      });
      return null;
    }

    if (scheduledAppointments.length > 0) {
      throw new Error(
        "Cancel or complete the scheduled session before returning this request to the unassigned queue.",
      );
    }

    const now = Date.now();
    await ctx.db.patch(requestId, {
      assignedTo: undefined,
      assignedAt: undefined,
      status: "submitted",
      updatedAt: now,
    });
    await ctx.db.insert("careRequestEvents", {
      requestId,
      actorUserId: admin.subject,
      actorRole: "admin",
      action: "statusChanged",
      fromStatus: request.status,
      toStatus: "submitted",
      createdAt: now,
    });
    return null;
  },
});

async function updateStaffRequestStatus(
  ctx: MutationCtx,
  {
    requestId,
    status,
    requestType,
    staffId,
    actorRole,
  }: {
    requestId: Id<"careRequests">;
    status: StaffUpdateStatus;
    requestType: StaffRequestType;
    staffId: string;
    actorRole: StaffActorRole;
  },
): Promise<null> {
  const request = await ctx.db.get(requestId);
  if (!request) throw new Error("This request no longer exists.");
  if (request.requestType !== requestType) {
    throw new Error(
      `${actorRole === "clinical" ? "Clinical staff" : "Counselors"} may only update ${requestType} requests.`,
    );
  }
  if (request.assignedTo && request.assignedTo !== staffId) {
    throw new Error("This request is assigned to another staff member.");
  }

  const claimingUnassigned =
    (request.status === "submitted" && status === "inReview") ||
    (request.status === "inReview" && status === "inReview" && !request.assignedTo);
  if (!claimingUnassigned) {
    if (request.assignedTo !== staffId) {
      throw new Error("Claim this request before updating its status.");
    }
    const allowedTransitions: Record<string, string[]> = {
      submitted: ["inReview"],
      inReview: ["contacted"],
      contacted: ["closed"],
      closed: [],
    };
    if (!allowedTransitions[request.status]?.includes(status)) {
      throw new Error("That status transition is not allowed.");
    }
  }

  if (status === "closed") {
    const scheduledAppointment = await ctx.db
      .query("careAppointments")
      .withIndex("by_requestId_status_scheduledAt", (q) =>
        q.eq("requestId", requestId).eq("status", "scheduled"),
      )
      .take(1);
    if (scheduledAppointment.length > 0) {
      throw new Error(
        "Complete or cancel the scheduled session before closing this request.",
      );
    }
  }

  const now = Date.now();
  await ctx.db.patch(requestId, {
    status,
    updatedAt: now,
    ...(claimingUnassigned ? { assignedTo: staffId, assignedAt: now } : {}),
  });
  await ctx.db.insert("careRequestEvents", {
    requestId,
    actorUserId: staffId,
    actorRole,
    action: claimingUnassigned ? "assigned" : "statusChanged",
    fromStatus: request.status,
    toStatus: status,
    createdAt: now,
  });
  return null;
}
