import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { action, ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID!;

const MAX_TEXT_LENGTH = 500;

export const generateAudio = action({
  args: {
    storyId: v.id("story"),
    voiceId: v.string(),
  },
  handler: async (
    ctx: ActionCtx,
    args: { storyId: Id<"story">; voiceId: string }
  ): Promise<{ success: boolean; audioUrl?: string; error?: string }> => {
    const { storyId, voiceId } = args;

    // 获取故事文本
    const story = await ctx.runQuery(api.story.getStory, { storyId });
    if (!story) {
      return { success: false, error: "Story not found" };
    }

    const text = story.script; // 假设故事内容存储在 script 字段

    console.log("Generating audio", {
      text: text.substring(0, 100) + "...",
      voiceId,
    });

    // 预处理文本：替换段落切换为换行符，并处理自定义间隔
    const processedText = text
      .replace(/\n\n+/g, "\n")
      .replace(/<#(\d+(\.\d{1,2})?)#>/g, (_, time) => `\n<#${time}#>\n`);

    // 分割文本
    const textChunks = splitText(processedText, MAX_TEXT_LENGTH);
    const audioChunks: Uint8Array[] = [];

    for (const chunk of textChunks) {
      try {
        const response = await fetch(
          `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${MINIMAX_API_KEY}`,
            },
            body: JSON.stringify({
              model: "speech-01-turbo",
              text: chunk,
              stream: false,
              timber_weights: [
                {
                  voice_id: voiceId,
                  weight: 1,
                },
              ],
              voice_setting: {
                voice_id: "",
                speed: 1,
                vol: 1,
                pitch: 0,
              },
              audio_setting: {
                sample_rate: 32000,
                bitrate: 128000,
                format: "mp3",
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Audio generation failed: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        if (data.base_resp.status_code !== 0) {
          throw new Error(`API error: ${data.base_resp.status_msg}`);
        }

        if (data.data && data.data.audio) {
          const audioData = hexToUint8Array(data.data.audio);
          audioChunks.push(audioData);
        } else {
          throw new Error("No audio data in response");
        }
      } catch (error) {
        console.error("Error in generateAudio chunk", error);
        throw error;
      }
    }

    // 合并音频块
    const combinedAudio = concatenateUint8Arrays(audioChunks);

    try {
      // 上传合并后的音频
      const audioUrl = await uploadAudioToStorage(ctx, combinedAudio);
      console.log("Audio uploaded, URL:", audioUrl);
      return { success: true, audioUrl };
    } catch (error) {
      console.error("Error uploading audio:", error);
      return { success: false, error: "Failed to upload audio" };
    }
  },
});

function hexToUint8Array(hexString: string): Uint8Array {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
}

function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}

// 实现这个函数来上传音频到你的存储服务
async function uploadAudioToStorage(
  ctx: any,
  audioData: Uint8Array
): Promise<string> {
  try {
    // 只在存储时将 Uint8Array 转换为 Blob
    const blob = new Blob([audioData], { type: "audio/mpeg" });
    const storageId = await ctx.storage.store(blob);
    const url = await ctx.storage.getUrl(storageId);
    console.log("Audio stored with URL:", url);
    return url;
  } catch (error) {
    console.error("Error storing audio:", error);
    throw new Error("Failed to store audio file");
  }
}

function splitText(text: string, maxLength: number): string[] {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence + " ";
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence + " ";
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}
