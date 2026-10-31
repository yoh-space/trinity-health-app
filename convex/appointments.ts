import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Id } from "./_generated/dataModel";
import { requireActiveStaff, requireIdentity, type StaffRole } from "./auth";

const appointmentStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("completed"),
  v.literal("cancelled"),
);
const appointmentFormatValidator = v.union(
  v.literal("online"),
  v.literal("inPerson"),
);
const appointmentResultValidator = v.object({
  _id: v.id("careAppointments"),
  requestId: v.id("careRequests"),
  requestType: v.union(v.literal("clinical"), v.literal("counselling")),
  requestSummary: v.optional(v.string()),
  scheduledAt: v.number(),
  durationMinutes: v.number(),
  format: appointmentFormatValidator,
  status: appointmentStatusValidator,
});
const adminAppointmentResultValidator = v.object({
  _id: v.id("careAppointments"),
  requestId: v.id("careRequests"),
  requestType: v.union(v.literal("clinical"), v.literal("counselling")),
  staffName: v.string(),
  scheduledAt: v.number(),
  durationMinutes: v.number(),
  format: appointmentFormatValidator,
});

function staffRoleFrom(value: unknown): StaffRole | null {
  return value === "counselor" || value === "clinician" || value === "admin"
    ? value
    : null;
}

function roleForRequestType(
  requestType: "clinical" | "counselling",
): StaffRole {
  return requestType === "clinical" ? "clinician" : "counselor";
}

export const listMyAppointments = query({
  args: {},
  returns: v.array(appointmentResultValidator),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const role = staffRoleFrom(identity.role);
    if (!role) throw new Error("An authorized staff role is required.");
    await requireActiveStaff(ctx, role);

    const appointments = await ctx.db
      .query("careAppointments")
      .withIndex("by_staffUserId_status_scheduledAt", (q) =>
        q.eq("staffUserId", identity.subject).eq("status", "scheduled"),
      )
      .order("asc")
      .take(50);

    const results = await Promise.all(
      appointments.map(async (appointment) => {
        const request = await ctx.db.get(appointment.requestId);
        if (!request) return null;
        return {
          _id: appointment._id,
          requestId: appointment.requestId,
          requestType: request.requestType,
          ...(request.requestSummary
            ? { requestSummary: request.requestSummary }
            : {}),
          scheduledAt: appointment.scheduledAt,
          durationMinutes: appointment.durationMinutes,
          format: appointment.format,
          status: appointment.status,
        };
      }),
    );

    return results.flatMap((appointment) => (appointment ? [appointment] : []));
  },
});

export const listUpcomingForAdmin = query({
  args: { now: v.number() },
  returns: v.array(adminAppointmentResultValidator),
  handler: async (ctx, { now }) => {
    await requireActiveStaff(ctx, "admin");
    const appointments = await ctx.db
      .query("careAppointments")
      .withIndex("by_status_scheduledAt", (q) =>
        q.eq("status", "scheduled").gte("scheduledAt", now),
      )
      .order("asc")
      .take(10);

    const results = await Promise.all(
      appointments.map(async (appointment) => {
        const request = await ctx.db.get(appointment.requestId);
        if (!request) return null;
        const staff = await ctx.db
          .query("staffProfiles")
          .withIndex("by_clerkUserId", (q) =>
            q.eq("clerkUserId", appointment.staffUserId),
          )
          .unique();
        return {
          _id: appointment._id,
          requestId: appointment.requestId,
          requestType: request.requestType,
          staffName: staff?.displayName ?? "Staff member",
          scheduledAt: appointment.scheduledAt,
          durationMinutes: appointment.durationMinutes,
          format: appointment.format,
        };
      }),
    );

    return results.flatMap((appointment) => (appointment ? [appointment] : []));
  },
});

export const listAppointmentsForRequest = query({
  args: { requestId: v.id("careRequests") },
  returns: v.array(appointmentResultValidator),
  handler: async (ctx, { requestId }) => {
    const identity = await requireIdentity(ctx);
    const role = staffRoleFrom(identity.role);
    if (!role) throw new Error("An authorized staff role is required.");
    await requireActiveStaff(ctx, role);

    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("This request no longer exists.");
    if (role !== "admin" && role !== roleForRequestType(request.requestType)) {
      throw new Error("This request is outside your staff role.");
    }
    if (role !== "admin" && request.assignedTo !== identity.subject) {
      throw new Error("Claim this request before viewing its appointments.");
    }

    const appointments = await ctx.db
      .query("careAppointments")
      .withIndex("by_requestId_scheduledAt", (q) =>
        q.eq("requestId", requestId),
      )
      .order("desc")
      .take(20);

    return appointments.map((appointment) => ({
      _id: appointment._id,
      requestId: appointment.requestId,
      requestType: request.requestType,
      ...(request.requestSummary
        ? { requestSummary: request.requestSummary }
        : {}),
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      format: appointment.format,
      status: appointment.status,
    }));
  },
});

export const scheduleMyAppointment = mutation({
  args: {
    requestId: v.id("careRequests"),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    format: appointmentFormatValidator,
  },
  returns: v.id("careAppointments"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const role = staffRoleFrom(identity.role);
    if (!role || role === "admin") {
      throw new Error("Only a counselor or clinician can schedule a session.");
    }
    await requireActiveStaff(ctx, role);

    if (args.scheduledAt <= Date.now()) {
      throw new Error("Choose a future date and time.");
    }
    if (
      !Number.isInteger(args.durationMinutes) ||
      args.durationMinutes < 15 ||
      args.durationMinutes > 120
    ) {
      throw new Error("Session duration must be between 15 and 120 minutes.");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("This request no longer exists.");
    if (role !== roleForRequestType(request.requestType)) {
      throw new Error("This request is outside your staff role.");
    }
    if (request.status === "closed") {
      throw new Error("A session cannot be scheduled for a closed request.");
    }
    if (request.assignedTo !== identity.subject) {
      throw new Error("Claim this request before scheduling a session.");
    }

    const current = await ctx.db
      .query("careAppointments")
      .withIndex("by_requestId_status_scheduledAt", (q) =>
        q.eq("requestId", args.requestId).eq("status", "scheduled"),
      )
      .order("desc")
      .take(1);
    const now = Date.now();
    let appointmentId: Id<"careAppointments">;
    if (current[0]) {
      appointmentId = current[0]._id;
      await ctx.db.patch(appointmentId, {
        staffUserId: identity.subject,
        scheduledAt: args.scheduledAt,
        durationMinutes: args.durationMinutes,
        format: args.format,
        updatedAt: now,
      });
    } else {
      appointmentId = await ctx.db.insert("careAppointments", {
        requestId: args.requestId,
        staffUserId: identity.subject,
        scheduledAt: args.scheduledAt,
        durationMinutes: args.durationMinutes,
        format: args.format,
        status: "scheduled",
        createdBy: identity.subject,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("careRequestEvents", {
      requestId: args.requestId,
      actorUserId: identity.subject,
      actorRole: role === "clinician" ? "clinical" : "counselor",
      action: current[0] ? "appointmentRescheduled" : "appointmentScheduled",
      fromStatus: request.status,
      toStatus: request.status,
      createdAt: now,
    });
    return appointmentId;
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("careAppointments"),
    status: v.union(v.literal("completed"), v.literal("cancelled")),
  },
  returns: v.null(),
  handler: async (ctx, { appointmentId, status }) => {
    const identity = await requireIdentity(ctx);
    const role = staffRoleFrom(identity.role);
    if (!role) throw new Error("An authorized staff role is required.");
    await requireActiveStaff(ctx, role);

    const appointment = await ctx.db.get(appointmentId);
    if (!appointment) throw new Error("This appointment no longer exists.");
    const request = await ctx.db.get(appointment.requestId);
    if (!request) throw new Error("This request no longer exists.");
    if (role !== "admin") {
      if (role !== roleForRequestType(request.requestType)) {
        throw new Error("This request is outside your staff role.");
      }
      if (appointment.staffUserId !== identity.subject) {
        throw new Error("Only the assigned staff member can update this session.");
      }
    }
    if (appointment.status !== "scheduled") {
      throw new Error("Only scheduled sessions can be completed or cancelled.");
    }

    const now = Date.now();
    await ctx.db.patch(appointmentId, { status, updatedAt: now });
    await ctx.db.insert("careRequestEvents", {
      requestId: request._id,
      actorUserId: identity.subject,
      actorRole:
        role === "admin" ? "admin" : role === "clinician" ? "clinical" : "counselor",
      action:
        status === "completed"
          ? "appointmentCompleted"
          : "appointmentCancelled",
      fromStatus: request.status,
      toStatus: request.status,
      createdAt: now,
    });
    return null;
  },
});
