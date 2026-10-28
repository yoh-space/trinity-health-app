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
});
