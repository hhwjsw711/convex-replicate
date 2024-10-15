import { v } from "convex/values";
import { action, query, mutation, ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";

// 视频状态枚举
const VideoStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
} as const;

type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

// 类型定义
type GenerateVideoWithAudioArgs = {
  storyId: Id<"story">;
  voiceId: string;
  includeWatermark: boolean;
  isPublic: boolean;
  isLaxSpacing: boolean;
  includeCaptions: boolean;
  captionPosition: string;
  highlightColor: string;
};

type GenerateVideoWithAudioResult = {
  status: "started" | "error";
  message: string;
  videoId: Id<"video">;
};

// 创建新的视频记录
export const createVideo = mutation({
  args: { storyId: v.id("story") },
  handler: async (ctx, { storyId }) => {
    return await ctx.db.insert("video", {
      storyId,
      status: "pending",
    });
  },
});

// 更新视频状态
export const updateVideoStatus = mutation({
  args: { videoId: v.id("video"), status: v.string() },
  handler: async (ctx, { videoId, status }) => {
    await ctx.db.patch(videoId, { status });
  },
});

// 更新视频信息
export const updateVideo = mutation({
  args: {
    videoId: v.id("video"),
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
  },
  handler: async (ctx, args) => {
    const { videoId, ...updates } = args;
    await ctx.db.patch(videoId, updates);
  },
});

// 更新视频音频信息
export const updateVideoAudio = mutation({
  args: {
    videoId: v.id("video"),
    audioUrl: v.string(),
    audioGeneratedAt: v.string(),
  },
  handler: async (ctx, { videoId, audioUrl, audioGeneratedAt }) => {
    await ctx.db.patch(videoId, { audioUrl, audioGeneratedAt });
  },
});

// 生成视频和音频的主函数
export const generateVideoWithAudio = action({
  args: {
    storyId: v.id("story"),
    voiceId: v.string(),
    includeWatermark: v.boolean(),
    isPublic: v.boolean(),
    isLaxSpacing: v.boolean(),
    includeCaptions: v.boolean(),
    captionPosition: v.string(),
    highlightColor: v.string(),
  },
  handler: async (
    ctx: ActionCtx,
    args: GenerateVideoWithAudioArgs
  ): Promise<GenerateVideoWithAudioResult> => {
    const { storyId } = args;

    // 创建新的视频记录
    const videoId = await ctx.runMutation(api.videos.createVideo, { storyId });

    try {
      // 更新视频状态为 "processing"
      await ctx.runMutation(api.videos.updateVideoStatus, {
        videoId,
        status: VideoStatus.PROCESSING,
      });

      // 生成音频
      const audioResult = await ctx.runAction(api.audio.generateAudio, {
        storyId,
        voiceId: args.voiceId,
      });

      if (!audioResult.success || !audioResult.audioUrl) {
        throw new Error(audioResult.error || "Failed to generate audio");
      }

      // 更新视频记录的音频信息
      await ctx.runMutation(api.videos.updateVideoAudio, {
        videoId,
        audioUrl: audioResult.audioUrl,
        audioGeneratedAt: new Date().toISOString(),
      });

      // 启动视频生成过程
      await ctx.runAction(api.videos.processVideoAndAudio, {
        videoId,
        audioUrl: audioResult.audioUrl,
        includeWatermark: args.includeWatermark,
        isLaxSpacing: args.isLaxSpacing,
        includeCaptions: args.includeCaptions,
        captionPosition: args.captionPosition,
        highlightColor: args.highlightColor,
      });

      return {
        status: "started",
        message:
          "Audio generated and video generation process has been initiated.",
        videoId,
      };
    } catch (error) {
      // 如果出现错误，更新视频状态为 "error"
      await ctx.runMutation(api.videos.updateVideoStatus, {
        videoId,
        status: VideoStatus.ERROR,
      });

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        videoId,
      };
    }
  },
});

// 处理视频和音频生成的函数
export const processVideoAndAudio = action({
  args: {
    videoId: v.id("video"),
    audioUrl: v.string(),
    includeWatermark: v.boolean(),
    isLaxSpacing: v.boolean(),
    includeCaptions: v.boolean(),
    captionPosition: v.string(),
    highlightColor: v.string(),
  },
  handler: async (ctx, args) => {
    const {
      videoId,
      audioUrl,
      includeWatermark,
      isLaxSpacing,
      includeCaptions,
      captionPosition,
      highlightColor,
    } = args;

    try {
      // 这里添加实际的视频生成逻辑
      // 例如，调用外部服务或使用 Remotion 等工具生成视频

      // 模拟视频生成过程
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const videoUrl = `https://example.com/generated-video-${videoId}.mp4`;

      // 更新视频信息
      await ctx.runMutation(api.videos.updateVideo, {
        videoId,
        videoUrl,
        videoGeneratedAt: new Date().toISOString(),
      });

      // 如果需要字幕，启动转录过程
      if (includeCaptions) {
        // 调用转录服务
        const transcriptionResponse = await fetch(
          `${process.env.CONVEX_SITE_URL}/transcribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ audioUrl, videoId }),
          }
        );

        if (!transcriptionResponse.ok) {
          throw new Error("Failed to start transcription");
        }

        // 更新视频状态为等待转录
        await ctx.runMutation(api.videos.updateVideoStatus, {
          videoId,
          status: "transcribing",
        });
      } else {
        // 如果不需要字幕，直接将状态设置为完成
        await ctx.runMutation(api.videos.updateVideoStatus, {
          videoId,
          status: "completed",
        });
      }

      return { success: true, videoUrl };
    } catch (error) {
      // 如果出现错误，更新视频状态为 "error"
      await ctx.runMutation(api.videos.updateVideoStatus, {
        videoId,
        status: "error",
      });

      throw error;
    }
  },
});

// 获取视频信息的查询
export const getVideo = query({
  args: { videoId: v.id("video") },
  handler: async (ctx, args): Promise<Doc<"video"> | null> => {
    return await ctx.db.get(args.videoId);
  },
});

export const getVideoByStoryId = query({
  args: { storyId: v.id("story") },
  handler: async (ctx, args): Promise<Doc<"video"> | null> => {
    return await ctx.db
      .query("video")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .first();
  },
});

// 定义 Word 类型
type Word = {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number | null;
};

// 定义 TranscriptionStatus 类型
type TranscriptionStatus = {
  status: "completed" | "error" | "processing";
  text?: string;
  words?: Word[];
  error?: string;
};

// 定义 CheckTranscriptionStatusResult 类型
type CheckTranscriptionStatusResult =
  | { status: "completed"; captionsUrl: string }
  | { status: "error"; error: string }
  | { status: "processing" };

// 新增：检查转录状态的函数
export const checkTranscriptionStatus = action({
  args: { videoId: v.id("video") },
  handler: async (ctx, args): Promise<CheckTranscriptionStatusResult> => {
    const video: Doc<"video"> | null = await ctx.runQuery(api.videos.getVideo, {
      videoId: args.videoId,
    });
    if (!video || !video.transcriptionJobId) {
      throw new Error("Video not found or transcription not started");
    }

    const response: Response = await fetch(
      `https://api.assemblyai.com/v2/transcript/${video.transcriptionJobId}`,
      {
        headers: {
          Authorization: process.env.ASSEMBLYAI_API_KEY!,
        },
      }
    );

    const transcriptionStatus: TranscriptionStatus = await response.json();

    if (
      transcriptionStatus.status === "completed" &&
      transcriptionStatus.words
    ) {
      // 转录完成，生成字幕文件
      const vttContent = generateVTTFile(transcriptionStatus.words);

      // 上传到 Convex 存储
      const captionsStorageId = await uploadCaptionsToStorage(ctx, vttContent);

      // 确保 transcriptionWords 符合我们定义的结构
      const formattedWords = transcriptionStatus.words.map(word => ({
        text: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
        speaker: word.speaker ?? null, // 如果 speaker 不存在，设为 null
      }));

      // 更新视频信息
      await ctx.runMutation(api.videos.updateVideo, {
        videoId: args.videoId,
        captionsUrl: captionsStorageId,
        transcriptionText: transcriptionStatus.text,
        transcriptionWords: formattedWords,
        captionsGeneratedAt: new Date().toISOString(),
      });

      // 单独更新视频状态
      await ctx.runMutation(api.videos.updateVideoStatus, {
        videoId: args.videoId,
        status: "completed",
      });

      return { status: "completed", captionsUrl: captionsStorageId };
    } else if (transcriptionStatus.status === "error") {
      await ctx.runMutation(api.videos.updateVideoStatus, {
        videoId: args.videoId,
        status: "error",
      });
      return {
        status: "error",
        error: transcriptionStatus.error || "Unknown error",
      };
    } else {
      return { status: "processing" };
    }
  },
});

// 辅助函数：生成 VTT 文件内容
function generateVTTFile(words: Array<{ text: string; start: number; end: number; speaker: number | null }>): string {
    let vtt = "WEBVTT\n\n";
    let currentLine = "";
    let startTime = "";
    let endTime = "";
    let currentSpeaker: number | null = null;
  
    words.forEach((word, index) => {
      if (currentSpeaker !== word.speaker || currentLine.length + word.text.length > 40 || index === words.length - 1) {
        if (currentLine) {
          endTime = formatTime(word.end);
          vtt += `${startTime} --> ${endTime}\n`;
          if (currentSpeaker !== null) {
            vtt += `<v Speaker ${currentSpeaker}>${currentLine.trim()}</v>\n\n`;
          } else {
            vtt += `${currentLine.trim()}\n\n`;
          }
        }
        currentLine = word.text + " ";
        startTime = formatTime(word.start);
        currentSpeaker = word.speaker;
      } else {
        currentLine += word.text + " ";
      }
    });
  
    return vtt;
  }

// 辅助函数：格式化时间
function formatTime(milliseconds: number): string {
  const date = new Date(milliseconds);
  return date.toISOString().substr(11, 12);
}

// 实现上传字幕到 Convex 存储的函数
async function uploadCaptionsToStorage(
  ctx: ActionCtx,
  vttContent: string
): Promise<string> {
  // 创建一个 Blob 对象
  const blob = new Blob([vttContent], { type: "text/vtt" });

  // 上传到 Convex 存储
  const storageId = await ctx.storage.store(blob);

  // 返回存储 ID，这可以用来later检索文件
  return storageId;
}

// 添加一个新的查询函数来获取字幕内容
export const getCaptions = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Captions not found");
    }

    // 使用 fetch 来获取内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch captions");
    }

    return await response.text();
  },
});

export const queryUserStoryVideos = query({
  handler: async (ctx) => {
    console.log("Starting queryUserStoryVideos");
    const userId = await auth.getUserId(ctx);
    console.log("User ID from auth.getUserId:", userId);

    if (userId === null) {
      console.log("No user ID found");
      throw new Error("Not authenticated");
    }

    // 获取用户的所有故事
    const userStories = await ctx.db
      .query("story")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    console.log("User stories:", userStories);

    const storyIds = userStories.map(story => story._id);

    if (storyIds.length === 0) {
      console.log("No stories found for user");
      return [];
    }

    // 获取与这些故事相关的所有视频
    const videos = await ctx.db
      .query("video")
      .filter((q) => 
        q.or(
          ...storyIds.map(storyId => q.eq(q.field("storyId"), storyId))
        )
      )
      .collect();

    console.log("Videos found:", videos);

    // 将故事信息添加到视频对象中
    const videosWithStoryInfo = videos.map(video => {
      const story = userStories.find(s => s._id === video.storyId);
      return { 
        ...video, 
        storyTitle: story ? story.title : 'Unknown'
      };
    });

    console.log("Videos with story info:", videosWithStoryInfo);

    return videosWithStoryInfo;
  },
});
