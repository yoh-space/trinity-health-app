import { v } from "convex/values";
import { type Auth } from "convex/server";
import { mutation, query } from "./_generated/server";

async function requireUserId({ auth }: { auth: Auth }) {
  const identity = await auth.getUserIdentity();
  if (!identity?.subject) throw new Error("Sign in is required to save a profile");
  return identity.subject;
}

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return null;

    return await ctx.db
      .query("onboardingProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

export const saveProfile = mutation({
  args: {
    consent: v.literal(true),
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
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const updatedAt = Date.now();
    const isAdult = ["age18to39", "age40to59", "age60plus"].includes(args.age);
    const bmiEligible =
      args.audience === "myself" &&
      isAdult &&
      !args.support.includes("pregnancy");

    let heightCm: number | undefined;
    let weightKg: number | undefined;
    let bmi: number | undefined;
    if (bmiEligible && args.heightCm !== undefined && args.weightKg !== undefined) {
      if (
        !Number.isFinite(args.heightCm) ||
        !Number.isFinite(args.weightKg) ||
        args.heightCm < 100 ||
        args.heightCm > 250 ||
        args.weightKg < 25 ||
        args.weightKg > 300
      ) {
        throw new Error("Height or weight is outside the accepted range");
      }
      heightCm = args.heightCm;
      weightKg = args.weightKg;
      const heightM = args.heightCm / 100;
      bmi = Math.round((args.weightKg / (heightM * heightM)) * 10) / 10;
    }

    const profile = {
      userId,
      audience: args.audience,
      age: args.age,
      support: args.support,
      generalSupport: args.generalSupport,
      otherSupport: args.otherSupport,
      meals: args.meals,
      activity: args.activity,
      eatingPatterns: args.eatingPatterns,
      goals: args.goals,
      otherGoal: args.otherGoal,
      consultation: args.consultation,
      otherConsultation: args.otherConsultation,
      ...(heightCm !== undefined && weightKg !== undefined && bmi !== undefined
        ? { heightCm, weightKg, bmi }
        : {}),
      consentedAt: updatedAt,
      updatedAt,
    };

    const existing = await ctx.db
      .query("onboardingProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.replace(existing._id, profile);
      return existing._id;
    }
    return await ctx.db.insert("onboardingProfiles", profile);
  },
});
