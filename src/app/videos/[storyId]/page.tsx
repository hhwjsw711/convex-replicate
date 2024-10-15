"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction, useQueries } from "convex/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { Player } from "@remotion/player";
import { RemotionVideo } from "./remotion-video";

type VideoData = {
  script: string;
  isVertical: boolean;
  audioUrl?: string;
  transcriptionWords?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  segments: Array<{
    text: string;
    imageUrl?: string;
    order: number;
  }>;
};

const FPS = 30;

export default function VideoDetail() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as Id<"story">;

  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const story = useQuery(api.story.getStory, { storyId });
  const video = useQuery(api.videos.getVideoByStoryId, { storyId });
  const segments = useQuery(api.segments.getSegments, { storyId });

  // 使用 useMemo 来计算 imageQueries
  const imageQueries = useMemo(() => {
    return segments?.reduce((acc, segment, index) => {
      if (segment.image) {
        acc[`imageUrl_${index}`] = {
          query: api.segments.getImageUrl,
          args: { storageId: segment.image }
        };
      }
      return acc;
    }, {} as Record<string, { query: typeof api.segments.getImageUrl, args: { storageId: Id<"_storage"> } }>) ?? {};
  }, [segments]);

  const imageUrlsResult = useQueries(imageQueries);

  // 使用 useMemo 来计算 videoData
  const videoData: VideoData | null = useMemo(() => {
    if (!story || !video || !segments) {
      return null;
    }

    console.log('imageUrlsResult:', imageUrlsResult);

    // 检查 imageUrlsResult 是否为空对象
    if (Object.keys(imageUrlsResult).length === 0) {
      // 如果没有图片查询，我们可以直接处理其他数据
      return {
        script: story.script,
        isVertical: story.isVertical ?? false,
        audioUrl: video.audioUrl,
        transcriptionWords: video.transcriptionWords?.map(({ text, start, end }) => ({ text, start, end })),
        segments: segments.map(segment => ({
          ...segment,
          imageUrl: undefined
        })),
      };
    }

    // 如果有图片查询，检查它们是否都已加载完成
    if (Object.values(imageUrlsResult).some(result => result?.status === "loading")) {
      return null;
    }

    const segmentsWithImageUrls = segments.map((segment, index) => {
      const imageUrlResult = imageUrlsResult[`imageUrl_${index}`];
      console.log(`Segment ${index} imageUrlResult:`, imageUrlResult);
      return {
        ...segment,
        imageUrl: imageUrlResult // 直接使用 imageUrlResult，不需要检查 status
      };
    });

    return {
      script: story.script,
      isVertical: story.isVertical ?? false,
      audioUrl: video.audioUrl,
      transcriptionWords: video.transcriptionWords?.map(({ text, start, end }) => ({ text, start, end })),
      segments: segmentsWithImageUrls,
    };
  }, [story, video, segments, imageUrlsResult]);

  const checkTranscriptionStatusAction = useAction(
    api.videos.checkTranscriptionStatus
  );

  const checkTranscriptionStatus = useCallback(
    (videoId: Id<"video">) => checkTranscriptionStatusAction({ videoId }),
    [checkTranscriptionStatusAction]
  );

  useEffect(() => {
    if (!video) return;

    if (video.status === "processing") {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 10, 90);
          return video.status === "processing" ? newProgress : 100;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (video.status === "completed") {
      setProgress(100);
    } else if (video.status === "transcribing" && video._id) {
      const interval = setInterval(async () => {
        const result = await checkTranscriptionStatus(video._id);
        if (result.status === "completed" || result.status === "error") {
          clearInterval(interval);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [video, checkTranscriptionStatus]);

  useEffect(() => {
    if (videoData && videoData.audioUrl) {
      const audio = new Audio(videoData.audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setVideoDuration(Math.ceil(audio.duration * FPS));
      });
    }
  }, [videoData]);

  if (!videoData || !video) {
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
              Status: {video.status}
            </h2>
            {video.status === "processing" && (
              <div className="mb-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">
                  Generating video... This may take a few minutes.
                </p>
              </div>
            )}
            {video.status === "completed" && videoDuration > 0 && (
              <div className="mb-4">
                <Player
                  component={RemotionVideo}
                  inputProps={{ videoData: videoData, fps: FPS }}
                  durationInFrames={videoDuration}
                  compositionWidth={videoData.isVertical ? 1080 : 1920}
                  compositionHeight={videoData.isVertical ? 1920 : 1080}
                  fps={FPS}
                  controls
                  style={{
                    width: "100%",
                    aspectRatio: videoData.isVertical ? "9 / 16" : "16 / 9",
                  }}
                />
              </div>
            )}
            {video.status === "error" && (
              <p className="text-red-500">
                An error occurred during video generation. Please try again.
              </p>
            )}

            <div className="flex justify-between items-center mt-6">
              <div>
                <p className="text-sm text-gray-500">
                  Created at: {new Date(video._creationTime).toLocaleString()}
                </p>
                {video.videoGeneratedAt && (
                  <p className="text-sm text-gray-500">
                    Generated at:{" "}
                    {new Date(video.videoGeneratedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 text-gray-500">
                {video.status === "completed" && video.videoUrl && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => window.open(video.videoUrl, "_blank")}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
