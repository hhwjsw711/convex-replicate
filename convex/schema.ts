import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  credits: defineTable({
    userId: v.id("users"),
    remaining: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId_index", ["userId"]),
  story: defineTable({
    title: v.string(),
    userId: v.id("users"),
    script: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("processing"),
      v.literal("completed")
    ),
    isVertical: v.optional(v.boolean()),
    context: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  segments: defineTable({
    storyId: v.id("story"),
    text: v.string(),
    order: v.number(),
    isGenerating: v.boolean(),
    image: v.optional(v.id("_storage")),
    previewImage: v.optional(v.id("_storage")),
    prompt: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  sketches: defineTable({
    prompt: v.string(),
    result: v.optional(v.string()),
  }),
});
