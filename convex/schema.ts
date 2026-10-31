import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Retained while the starter note routes are phased out of existing clients.
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  educationContent: defineTable({
    authorTokenIdentifier: v.string(),
    contentKey: v.optional(v.string()),
    seedVersion: v.optional(v.number()),
    title: v.string(),
    titleAm: v.string(),
    summary: v.string(),
    summaryAm: v.string(),
    content: v.string(),
    contentAm: v.string(),
    category: v.string(),
    categoryKey: v.optional(v.string()),
    readMinutes: v.number(),
    sections: v.optional(
      v.array(
        v.object({
          title: v.string(),
          titleAm: v.string(),
          body: v.string(),
          bodyAm: v.string(),
        }),
      ),
    ),
    takeaway: v.optional(v.string()),
    takeawayAm: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    publishedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_authorTokenIdentifier", ["authorTokenIdentifier"])
    .index("by_category", ["category"])
    .index("by_contentKey", ["contentKey"]),
  onboardingProfiles: defineTable({
    userId: v.string(),
    audience: v.string(),
    age: v.string(),
    support: v.array(v.string()),
    generalSupport: v.boolean(),
    otherSupport: v.string(),
    meals: v.string(),
    activity: v.string(),
    eatingPatterns: v.array(v.string()),
    goals: v.array(v.string()),
    otherGoal: v.string(),
    consultation: v.string(),
    otherConsultation: v.string(),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    bmi: v.optional(v.number()),
    consentedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  careRequests: defineTable({
    userId: v.string(),
    requestType: v.union(v.literal("clinical"), v.literal("counselling")),
    contactMethod: v.union(v.literal("email"), v.literal("phone")),
    contactDetails: v.string(),
    requestSummary: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    assignedAt: v.optional(v.number()),
    status: v.union(
      v.literal("submitted"),
      v.literal("inReview"),
      v.literal("contacted"),
      v.literal("closed"),
    ),
    consentedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_status_createdAt", ["status", "createdAt"])
    .index("by_type_status_createdAt", ["requestType", "status", "createdAt"])
    .index("by_createdAt", ["createdAt"])
    .index("by_type_createdAt", ["requestType", "createdAt"])
    .index("by_assignedTo_status_createdAt", [
      "assignedTo",
      "status",
      "createdAt",
    ]),
  careRequestEvents: defineTable({
    requestId: v.id("careRequests"),
    actorUserId: v.string(),
    actorRole: v.union(
      v.literal("user"),
      v.literal("clinical"),
      v.literal("counselor"),
      v.literal("admin"),
    ),
    action: v.union(
      v.literal("submitted"),
      v.literal("statusChanged"),
      v.literal("assigned"),
      v.literal("appointmentScheduled"),
      v.literal("appointmentRescheduled"),
      v.literal("appointmentCancelled"),
      v.literal("appointmentCompleted"),
    ),
    fromStatus: v.optional(
      v.union(
        v.literal("submitted"),
        v.literal("inReview"),
        v.literal("contacted"),
        v.literal("closed"),
      ),
    ),
    toStatus: v.union(
      v.literal("submitted"),
      v.literal("inReview"),
      v.literal("contacted"),
      v.literal("closed"),
    ),
    createdAt: v.number(),
  }).index("by_requestId_createdAt", ["requestId", "createdAt"]),
  staffProfiles: defineTable({
    clerkUserId: v.string(),
    role: v.union(
      v.literal("counselor"),
      v.literal("clinician"),
      v.literal("admin"),
    ),
    displayName: v.string(),
    specialty: v.string(),
    availability: v.union(v.literal("available"), v.literal("away")),
    active: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_active_updatedAt", ["active", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),
  careAppointments: defineTable({
    requestId: v.id("careRequests"),
    staffUserId: v.string(),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    format: v.union(v.literal("online"), v.literal("inPerson")),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_staffUserId_status_scheduledAt", [
      "staffUserId",
      "status",
      "scheduledAt",
    ])
    .index("by_requestId_scheduledAt", ["requestId", "scheduledAt"])
    .index("by_requestId_status_scheduledAt", [
      "requestId",
      "status",
      "scheduledAt",
    ])
    .index("by_status_scheduledAt", ["status", "scheduledAt"]),
});
