"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction, useQueries } from "convex/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { Player } from "@remotion/player";
import { RemotionVideo } from "./remotion-video";
import { toast } from "@/hooks/use-toast";
import { VideoData } from "../../../../convex/types";

const FPS = 30;

export default function VideoDetail() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as Id<"story">;

  const [progress, setProgress] = useState(0);
  const [renderedVideoBlob, setRenderedVideoBlob] = useState<Blob | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const story = useQuery(api.story.getStory, { storyId });
  const video = useQuery(api.videos.getVideoByStoryId, { storyId });
  const segments = useQuery(api.segments.getSegments, { storyId });

  const saveRenderedVideoAction = useAction(api.videos.saveRenderedVideo);
  const checkTranscriptionStatusAction = useAction(
    api.videos.checkTranscriptionStatus
  );

  const imageQueries = useMemo(() => {
    return (
      segments?.reduce(
        (acc, segment, index) => {
          if (segment.image) {
            acc[`imageUrl_${index}`] = {
              query: api.segments.getImageUrl,
              args: { storageId: segment.image },
            };
          }
          return acc;
        },
        {} as Record<
          string,
          {
            query: typeof api.segments.getImageUrl;
            args: { storageId: Id<"_storage"> };
          }
        >
      ) ?? {}
    );
  }, [segments]);

  const imageUrlsResult = useQueries(imageQueries);

  const videoData: VideoData | null = useMemo(() => {
    if (!story || !video || !segments) {
      return null;
    }

    console.log("Raw imageUrlsResult:", imageUrlsResult);

    // 检查是否所有图片 URL 都已加载
    const allImagesLoaded = segments.every(
      (segment, index) => imageUrlsResult[`imageUrl_${index}`] !== undefined
    );

    if (!allImagesLoaded) {
      console.log("Not all images are loaded yet");
      return null;
    }

    const segmentsWithImageUrls = segments.map((segment, index) => ({
      text: segment.text,
      imageUrl: imageUrlsResult[`imageUrl_${index}`] as string,
      order: segment.order,
    }));

    console.log("Segments with image URLs:", segmentsWithImageUrls);

    return {
      script: story.script,
      isVertical: story.isVertical ?? false,
      audioUrl: video.audioUrl,
      transcriptionWords: video.transcriptionWords,
      segments: segmentsWithImageUrls,
    };
  }, [story, video, segments, imageUrlsResult]);

  console.log("Final videoData:", videoData);

  // 计算视频持续时间
  const videoDuration = useMemo(() => {
    if (video?.transcriptionWords?.length) {
      const lastWord =
        video.transcriptionWords[video.transcriptionWords.length - 1];
      return lastWord.end / 1000; // 转换为秒
    }
    return 0; // 默认值
  }, [video]);

  useEffect(() => {
    if (!video || video.status === "completed") return;

    const interval = setInterval(async () => {
      if (video.status === "processing") {
        setProgress((oldProgress) => Math.min(oldProgress + 10, 90));
      } else if (video.status === "transcribing") {
        const result = await checkTranscriptionStatusAction({
          storyId: storyId,
        });
        if (result.status === "completed" || result.status === "error") {
          clearInterval(interval);
          router.refresh();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [video, checkTranscriptionStatusAction, router, storyId]);

  const handleRenderVideo = useCallback(async () => {
    if (!video) return;
    setIsRendering(true);
    try {
      // 这里添加视频渲染逻辑
      // 渲染完成后设置 renderedVideoBlob
    } catch (error) {
      console.error("视频渲染错误:", error);
      toast({
        title: "Video rendering failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
    }
  }, [video]);

  const handleSaveVideo = useCallback(async () => {
    if (!renderedVideoBlob || !video?._id) return;

    try {
      // 将 Blob 转换为 base64 字符串
      const reader = new FileReader();
      reader.readAsDataURL(renderedVideoBlob);
      reader.onloadend = async function () {
        const base64data = reader.result as string;
        // 移除 data URL 前缀
        const base64Video = base64data.split(",")[1];

        const result = await saveRenderedVideoAction({
          storyId: video.storyId,
          videoBlob: base64Video,
        });

        if (result.success) {
          toast({
            title: "Video saved successfully",
            description: "Your video has been saved and is now available.",
            variant: "default",
          });
          router.refresh();
        } else {
          throw new Error("Failed to save video");
        }
      };
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error saving video",
        description: "There was a problem saving your video. Please try again.",
        variant: "destructive",
      });
    }
  }, [renderedVideoBlob, video, saveRenderedVideoAction, router]);

  const handleDownload = useCallback(() => {
    if (video?.videoUrl) {
      const link = document.createElement("a");
      link.href = video.videoUrl;
      link.download = `video-${video._id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [video]);

  if (!videoData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 space-y-8 py-32">
      <div className="container mx-auto">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push("/videos")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
          </Button>

          <h1 className="text-4xl font-bold text-center mb-8">Video Details</h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-500">
              Status: {video?.status}
            </h2>
            {video?.status !== "completed" && (
              <Progress value={progress} className="w-full mb-4" />
            )}
            {video?.status === "completed" && story && segments && (
              <Player
                component={RemotionVideo}
                inputProps={{ videoData, fps: FPS }}
                durationInFrames={Math.ceil((videoDuration || 0) * FPS)}
                compositionWidth={videoData.isVertical ? 1080 : 1920}
                compositionHeight={videoData.isVertical ? 1920 : 1080}
                fps={FPS}
                controls
                style={{
                  width: "100%",
                  aspectRatio: videoData.isVertical ? "9 / 16" : "16 / 9",
                }}
              />
            )}
            <div className="flex justify-between items-center mt-6">
              <div>
                <p className="text-sm text-gray-500">
                  Created at:{" "}
                  {video?._creationTime
                    ? new Date(video._creationTime).toLocaleString()
                    : "N/A"}
                </p>
                {video?.videoGeneratedAt && (
                  <p className="text-sm text-gray-500">
                    Generated at:{" "}
                    {new Date(video?.videoGeneratedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {video?.status === "completed" && video?.videoUrl && (
                  <>
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </>
                )}
                {!renderedVideoBlob && (
                  <Button onClick={handleRenderVideo} disabled={isRendering}>
                    {isRendering ? "Rendering..." : "Render Video"}
                  </Button>
                )}
                {renderedVideoBlob && (
                  <Button onClick={handleSaveVideo}>Save Video</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
