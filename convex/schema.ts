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
      v.literal("completed"),
      v.literal("error") // 添加 "error" 状态
    ),
    isVertical: v.optional(v.boolean()),
    context: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    grammarCheckedAt: v.optional(v.string()),
    createdAt: v.string(),
    // 保留这些字段，因为它们是生成选项而不是结果
    voiceId: v.optional(v.string()),
    includeWatermark: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    isLaxSpacing: v.optional(v.boolean()),
    includeCaptions: v.optional(v.boolean()),
    captionPosition: v.optional(v.string()),
    highlightColor: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  video: defineTable({
    storyId: v.id("story"),
    status: v.string(),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    captionsUrl: v.optional(v.string()),
    videoGeneratedAt: v.optional(v.string()),
    audioGeneratedAt: v.optional(v.string()),
    captionsGeneratedAt: v.optional(v.string()),
    transcriptionJobId: v.optional(v.string()),
    transcriptionText: v.optional(v.string()),
    transcriptionWords: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
          confidence: v.number(),
          speaker: v.union(v.null(), v.number()), // 添加 speaker 字段
        })
      )
    ),
    videoStorageId: v.optional(v.string()), // 新增字段
  }).index("by_story", ["storyId"]),
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
