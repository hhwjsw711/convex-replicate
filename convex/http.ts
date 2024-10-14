import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/transcribe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { audioUrl, videoId } = await request.json();

    const response = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_boost: ["true"],
      }),
    });

    const transcriptionJob = await response.json();

    // 保存转录作业 ID 到数据库
    await ctx.runMutation(api.videos.updateVideo, {
      videoId,
      transcriptionJobId: transcriptionJob.id,
    });

    return new Response(JSON.stringify(transcriptionJob), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

export default http;
