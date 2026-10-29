import { type Auth } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    return await ctx.db
      .query("careRequests")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", identity.subject),
      )
      .order("desc")
      .take(10);
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
    return await ctx.db.insert("careRequests", {
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
  },
});
