import { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const getStory = query({
  args: { storyId: v.id("story") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    // 获取与故事相关的所有段落
    let segments = await ctx.db
      .query("segments")
      .filter((q) => q.eq(q.field("storyId"), args.storyId))
      .collect();

    // 在 JavaScript 中按 order 字段排序
    segments = segments.sort((a, b) => a.order - b.order);

    // 返回故事信息，包括排序后的段落
    return {
      ...story,
      segments
    };
  },
});

export const updateStoryContent = internalMutation({
  args: { 
    storyId: v.id("story"),
    context: v.string()
  },
  handler: async (ctx, args) => {
    const { storyId, context } = args;
    await ctx.db.patch(storyId, { context });
    return { success: true };
  },
});

export const getStoryInternal = internalQuery({
  args: { storyId: v.id("story") },
  handler: async (ctx, args): Promise<Doc<"story"> | null> => {
    const { storyId } = args;
    
    const story = await ctx.db.get(storyId);
    
    if (!story) {
      console.warn(`Story with id ${storyId} not found`);
      return null;
    }
    
    return story;
  },
});

export const getAllStories = query({
  handler: async (ctx) => {
    const stories = await ctx.db.query("story").collect();
    return stories;
  },
});