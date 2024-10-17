import { Doc, Id } from "./_generated/dataModel";

// 视频状态类型
export type VideoStatus = "pending" | "processing" | "completed" | "error" | "transcribing" | "preview";

// 转录单词类型
export type TranscriptionWord = {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number | null;
};

// 视频文档类型
export type VideoDoc = Doc<"video"> & {
  storyId: Id<"story">;
  status: VideoStatus;
  videoUrl?: string;
  audioUrl?: string;
  captionsUrl?: string;
  videoGeneratedAt?: string;
  audioGeneratedAt?: string;
  captionsGeneratedAt?: string;
  transcriptionJobId?: string;
  transcriptionText?: string;
  transcriptionWords?: TranscriptionWord[];
};

// 生成音频和转录结果类型
export type GenerateAudioAndTranscriptionResult = {
  status: "started" | "error";
  message: string;
  videoId: Id<"video">;
  audioUrl?: string;
};

export type VideoData = {
  script: string;
  isVertical: boolean;
  audioUrl?: string;
  transcriptionWords?: TranscriptionWord[];
  segments: Array<{
    text: string;
    imageUrl: string;
    order: number;
  }>;
};