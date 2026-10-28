import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { educationSeedData } from "./educationSeedData";

const seedAuthorTokenIdentifier = "system:trinity-education-seed:v1";
const seedResultValidator = v.object({
  inserted: v.number(),
  updated: v.number(),
  legacyLinked: v.number(),
  unchanged: v.number(),
  records: v.array(
    v.object({
      contentKey: v.string(),
      result: v.union(
        v.literal("inserted"),
        v.literal("updated"),
        v.literal("legacy-linked"),
        v.literal("unchanged"),
      ),
    }),
  ),
});

function seedContentMatches(
  existing: {
    contentKey?: string;
    seedVersion?: number;
    title: string;
    titleAm: string;
    summary: string;
    summaryAm: string;
    content: string;
    contentAm: string;
    category: string;
    categoryKey?: string;
    readMinutes: number;
    sections?: Array<{
      title: string;
      titleAm: string;
      body: string;
      bodyAm: string;
    }>;
    takeaway?: string;
    takeawayAm?: string;
  },
  seeded: (typeof educationSeedData)[number],
) {
  return (
    existing.contentKey === seeded.contentKey &&
    existing.seedVersion === seeded.seedVersion &&
    existing.title === seeded.title &&
    existing.titleAm === seeded.titleAm &&
    existing.summary === seeded.summary &&
    existing.summaryAm === seeded.summaryAm &&
    existing.content === seeded.content &&
    existing.contentAm === seeded.contentAm &&
    existing.category === seeded.category &&
    existing.categoryKey === seeded.categoryKey &&
    existing.readMinutes === seeded.readMinutes &&
    JSON.stringify(existing.sections ?? null) ===
      JSON.stringify(seeded.sections ?? null) &&
    existing.takeaway === seeded.takeaway &&
    existing.takeawayAm === seeded.takeawayAm
  );
}

/**
 * Seed the five bilingual education fallbacks into a dev database.
 * New records start as drafts; matching legacy records are linked by key
 * without overwriting their copy or publication status.
 */
export const seedEducation = internalMutation({
  args: {},
  returns: seedResultValidator,
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    let legacyLinked = 0;
    let unchanged = 0;
    const records: Array<{
      contentKey: string;
      result: "inserted" | "updated" | "legacy-linked" | "unchanged";
    }> = [];

    for (const seeded of educationSeedData) {
      const existingByKey = await ctx.db
        .query("educationContent")
        .withIndex("by_contentKey", (q) =>
          q.eq("contentKey", seeded.contentKey),
        )
        .unique();

      if (existingByKey) {
        if (existingByKey.authorTokenIdentifier === seedAuthorTokenIdentifier) {
          if (seedContentMatches(existingByKey, seeded)) {
            unchanged += 1;
            records.push({
              contentKey: seeded.contentKey,
              result: "unchanged",
            });
            continue;
          }
          if (existingByKey.status === "published") {
            throw new Error(
              `Seed content ${seeded.contentKey} differs from its published record. Review and update it manually; the seed will not change published health content.`,
            );
          }
          const { legacyTitlePairs: _legacyTitlePairs, ...seedFields } = seeded;
          await ctx.db.patch(existingByKey._id, seedFields);
          updated += 1;
          records.push({ contentKey: seeded.contentKey, result: "updated" });
        } else {
          unchanged += 1;
          records.push({ contentKey: seeded.contentKey, result: "unchanged" });
        }
        continue;
      }

      const categoryRecords = await ctx.db
        .query("educationContent")
        .withIndex("by_category", (q) => q.eq("category", seeded.category))
        .take(101);
      const legacyTitlePairs = [
        { title: seeded.title, titleAm: seeded.titleAm },
        ...seeded.legacyTitlePairs,
      ];
      const legacyMatches = categoryRecords.filter((record) =>
        legacyTitlePairs.some(
          (pair) =>
            record.title === pair.title && record.titleAm === pair.titleAm,
        ),
      );

      if (legacyMatches.length > 1 || categoryRecords.length > 100) {
        throw new Error(
          `Cannot safely reconcile ${seeded.contentKey}: found an ambiguous or oversized category set. Review the dev educationContent records before rerunning.`,
        );
      }

      if (legacyMatches.length === 1) {
        await ctx.db.patch(legacyMatches[0]._id, {
          contentKey: seeded.contentKey,
          categoryKey: seeded.categoryKey,
        });
        legacyLinked += 1;
        records.push({
          contentKey: seeded.contentKey,
          result: "legacy-linked",
        });
        continue;
      }

      const { legacyTitlePairs: _legacyTitlePairs, ...seedFields } = seeded;
      await ctx.db.insert("educationContent", {
        ...seedFields,
        authorTokenIdentifier: seedAuthorTokenIdentifier,
        status: "draft",
      });
      inserted += 1;
      records.push({ contentKey: seeded.contentKey, result: "inserted" });
    }

    return { inserted, updated, legacyLinked, unchanged, records };
  },
});
