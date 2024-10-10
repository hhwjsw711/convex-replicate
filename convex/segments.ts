import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const createSegmentWithImageInternal = internalMutation({
  args: {
    userId: v.id("users"),
    storyId: v.id("story"),
    text: v.string(),
    order: v.number(),
    context: v.string(),
  },
  async handler(ctx, args) {
    const segmentId = await ctx.db.insert("segments", {
      storyId: args.storyId,
      text: args.text,
      order: args.order,
      isGenerating: true,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.segments.generateSegmentImageReplicateInternal,
      {
        segment: {
          text: args.text,
          _id: segmentId,
        },
        context: args.context,
      }
    );
  },
});

export const generateSegmentImageReplicateInternal = internalAction({
  args: {
    context: v.optional(v.string()),
    segment: v.object({
      text: v.string(),
      _id: v.id("segments"),
    }),
  },
  handler: async (ctx, args) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      const result = await model.generateContent([
        { text: getSystemPrompt(args.context) },
        { text: args.segment.text }
      ]);
      
      const response = result.response;
      const text = response.text();
      console.log("Gemini API response:", text);  // 添加日志

      let prompt;
      try {
        const parsedResponse = JSON.parse(text);
        prompt = parsedResponse.prompt;
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", parseError);
        // 如果无法解析为 JSON，直接使用返回的文本作为 prompt
        prompt = text;
      }

      if (!prompt) {
        throw new Error("Failed to generate prompt");
      }

      // 使用生成的提示来创建图像
      await ctx.runAction(internal.replicate.regenerateSegmentImageUsingPrompt, {
        segmentId: args.segment._id,
        prompt,
      });

      // 更新段落状态
      await ctx.runMutation(internal.segments.updateSegment, {
        segmentId: args.segment._id,
        isGenerating: false,
        prompt,
      });

    } catch (error) {
      console.error("Error in generateSegmentImageReplicateInternal:", error);
      
      // 更新段落状态，标记错误
      await ctx.runMutation(internal.segments.updateSegment, {
        segmentId: args.segment._id,
        isGenerating: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
});

function getSystemPrompt(context?: string): string {
  return `Given the context: ${context || 'No context provided'}, generate a detailed image prompt for the following text. Return only the prompt, without any additional text or formatting.`;
}

export const getSegmentInternal = internalQuery({
  args: { segmentId: v.id("segments") },
  handler: async (ctx, args) => {
    const { segmentId } = args;
    
    const segment = await ctx.db.get(segmentId);
    
    if (!segment) {
      throw new Error(`Segment with id ${segmentId} not found`);
    }
    
    return segment;
  },
});

export const updateSegment = internalMutation({
  args: {
    segmentId: v.id("segments"),
    isGenerating: v.optional(v.boolean()),
    image: v.optional(v.id("_storage")),
    previewImage: v.optional(v.id("_storage")),
    prompt: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { segmentId, ...updateFields } = args;

    // 移除所有未定义的字段
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateFields).filter(([, value]) => value !== undefined)
    );

    // 更新段落
    await ctx.db.patch(segmentId, fieldsToUpdate);

    return { success: true };
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getFirstSegment = query({
  args: { storyId: v.id("story") },
  handler: async (ctx, args) => {
    const segment = await ctx.db
      .query("segments")
      .filter((q) => q.eq(q.field("storyId"), args.storyId))
      .order("asc")
      .first();
    return segment;
  },
});