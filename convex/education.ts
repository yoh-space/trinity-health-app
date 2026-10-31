import { v } from "convex/values";
import { type Auth } from "convex/server";
import { internalQuery, mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

const contentArgs = {
  title: v.string(),
  titleAm: v.string(),
  summary: v.string(),
  summaryAm: v.string(),
  content: v.string(),
  contentAm: v.string(),
  category: v.string(),
  readMinutes: v.number(),
};

async function requirePublisher(ctx: { auth: Auth }) {
  return await requireRole(ctx, "admin");
}

function validateContent(args: {
  title: string;
  titleAm: string;
  summary: string;
  summaryAm: string;
  content: string;
  contentAm: string;
  category: string;
  readMinutes: number;
}) {
  const required = [
    args.title,
    args.titleAm,
    args.summary,
    args.summaryAm,
    args.content,
    args.contentAm,
    args.category,
  ];

  if (required.some((value) => !value.trim())) {
    throw new Error("Complete each English and Amharic field before saving.");
  }

  if (
    !Number.isInteger(args.readMinutes) ||
    args.readMinutes < 1 ||
    args.readMinutes > 60
  ) {
    throw new Error("Read time must be between 1 and 60 minutes.");
  }
}

export const listPublished = query({
  args: {},
  handler: async (ctx) =>
    await ctx.db
      .query("educationContent")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(50),
});

export const listPublishedForOpal = internalQuery({
  args: {},
  handler: async (ctx) =>
    await ctx.db
      .query("educationContent")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(50),
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requirePublisher(ctx);
    return await ctx.db.query("educationContent").order("desc").take(100);
  },
});

export const create = mutation({
  args: contentArgs,
  handler: async (ctx, args) => {
    const identity = await requirePublisher(ctx);
    validateContent(args);
    return await ctx.db.insert("educationContent", {
      ...args,
      authorTokenIdentifier: identity.tokenIdentifier,
      status: "draft",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("educationContent"),
    ...contentArgs,
  },
  handler: async (ctx, { id, ...args }) => {
    await requirePublisher(ctx);
    validateContent(args);
    const item = await ctx.db.get(id);
    if (!item) throw new Error("This education item no longer exists.");
    await ctx.db.patch(id, args);
  },
});

export const publish = mutation({
  args: { id: v.id("educationContent"), publish: v.boolean() },
  handler: async (ctx, { id, publish }) => {
    await requirePublisher(ctx);
    const item = await ctx.db.get(id);
    if (!item) throw new Error("This education item no longer exists.");

    await ctx.db.patch(id, {
      status: publish ? "published" : "draft",
      publishedAt: publish ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("educationContent") },
  handler: async (ctx, { id }) => {
    await requirePublisher(ctx);
    const item = await ctx.db.get(id);
    if (!item) throw new Error("This education item no longer exists.");
    await ctx.db.delete(id);
  },
});
