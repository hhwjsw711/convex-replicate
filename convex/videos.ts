import { v } from "convex/values";
import { action, query, mutation, ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";
import { GenerateAudioAndTranscriptionResult } from "./types";

// 类型定义
type Word = {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number | null;
};

type TranscriptionStatus = {
  status: "completed" | "error" | "processing";
  text?: string;
  words?: Word[];
  error?: string;
};

type CheckTranscriptionStatusResult =
  | { status: "completed"; captionsUrl: string }
  | { status: "error"; error: string }
  | { status: "processing" };

// 主要函数
export const checkTranscriptionStatus = action({
  args: { storyId: v.id("story") },
  handler: async (ctx, args): Promise<CheckTranscriptionStatusResult> => {
    const video = await ctx.runQuery(api.videos.getVideoByStoryId, {
      storyId: args.storyId,
    });
    if (!video || !video.transcriptionJobId) {
      throw new Error("Video not found or transcription not started");
    }

    const response = await fetch(
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
      const vttContent = generateVTTFile(transcriptionStatus.words);
      const captionsStorageId = await uploadCaptionsToStorage(ctx, vttContent);

      const formattedWords = transcriptionStatus.words.map((word) => ({
        text: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
        speaker: word.speaker ?? null,
      }));

      await ctx.runMutation(api.videos.updateVideo, {
        videoId: video._id,
        captionsUrl: captionsStorageId,
        transcriptionText: transcriptionStatus.text,
        transcriptionWords: formattedWords,
        captionsGeneratedAt: new Date().toISOString(),
        status: "completed",
      });

      return { status: "completed", captionsUrl: captionsStorageId };
    } else if (transcriptionStatus.status === "error") {
      await ctx.runMutation(api.videos.updateVideoStatus, {
        videoId: video._id,
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
function generateVTTFile(
  words: Array<{
    text: string;
    start: number;
    end: number;
    speaker: number | null;
  }>
): string {
  let vtt = "WEBVTT\n\n";
  let currentLine = "";
  let startTime = "";
  let endTime = "";
  let currentSpeaker: number | null = null;

  words.forEach((word, index) => {
    if (
      currentSpeaker !== word.speaker ||
      currentLine.length + word.text.length > 40 ||
      index === words.length - 1
    ) {
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
    status: v.optional(v.string()),
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
          speaker: v.union(v.null(), v.number()),
        })
      )
    ),
    videoStorageId: v.optional(v.string()), // 添加这一行
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

// 生成音频和转录的主函数
export const generateAudioAndTranscription = action({
  args: {
    storyId: v.id("story"),
    voiceId: v.string(),
  },
  handler: async (ctx, args): Promise<GenerateAudioAndTranscriptionResult> => {
    const { storyId, voiceId } = args;
    const videoId = await ctx.runMutation(api.videos.createVideo, { storyId });

    try {
      const audioResult = await ctx.runAction(api.audio.generateAudio, {
        storyId,
        voiceId,
      });
      if (!audioResult.success || !audioResult.audioUrl) {
        throw new Error(audioResult.error || "Failed to generate audio");
      }

      await ctx.runMutation(api.videos.updateVideo, {
        videoId,
        audioUrl: audioResult.audioUrl,
        audioGeneratedAt: new Date().toISOString(),
        status: "processing",
      });

      const transcriptionResponse = await fetch(
        `${process.env.CONVEX_SITE_URL}/transcribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioUrl: audioResult.audioUrl, videoId }),
        }
      );

      if (!transcriptionResponse.ok) {
        throw new Error("Failed to start transcription");
      }

      await ctx.runMutation(api.videos.updateVideo, {
        videoId,
        status: "transcribing",
      });

      return {
        status: "started",
        message:
          "Audio generated and transcription process has been initiated.",
        videoId,
        audioUrl: audioResult.audioUrl,
      };
    } catch (error) {
      await ctx.runMutation(api.videos.updateVideo, {
        videoId,
        status: "error",
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

export const saveRenderedVideo = action({
  args: { 
    storyId: v.id("story"), 
    videoBlob: v.string() // 期望接收 base64 编码的字符串
  },
  handler: async (ctx, args) => {
    const video = await ctx.runQuery(api.videos.getVideoByStoryId, { storyId: args.storyId });
    if (!video) {
      throw new Error("Video not found");
    }

    // 将 base64 编码的视频转换为 ArrayBuffer
    const binaryString = atob(args.videoBlob);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 创建 Blob 对象
    const blob = new Blob([bytes.buffer], { type: 'video/mp4' });

    // 上传到存储
    const storageId = await ctx.storage.store(blob);

    // 更新视频记录
    await ctx.runMutation(api.videos.updateVideo, {
      videoId: video._id,
      videoUrl: storageId,
      status: "completed",
    });

    return { success: true, videoUrl: storageId };
  },
});

export const getCaptions = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Captions not found");
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch captions");
    }

    return await response.text();
  },
});

export const listUserVideos = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const userStories = await ctx.db
      .query("story")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    if (userStories.length === 0) {
      return [];
    }

    const storyIds = userStories.map((story) => story._id);
    const videos = await ctx.db
      .query("video")
      .filter((q) =>
        q.or(...storyIds.map((storyId) => q.eq(q.field("storyId"), storyId)))
      )
      .collect();

    return videos.map((video) => ({
      ...video,
      storyTitle:
        userStories.find((s) => s._id === video.storyId)?.title || "Unknown",
    }));
  },
});

export const getVideoByStoryId = query({
  args: { storyId: v.id("story") },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("video")
      .filter((q) => q.eq(q.field("storyId"), args.storyId))
      .first();

    if (!video) {
      return null; // 或者抛出一个错误，取决于您的错误处理策略
    }

    return video;
  },
});
