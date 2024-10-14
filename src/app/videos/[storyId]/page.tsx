"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

export default function VideoDetail() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as Id<"story">;

  // 获取与 story 关联的 video
  const video = useQuery(api.videos.getVideoByStoryId, { storyId });

  const [progress, setProgress] = useState(0);

  // 使用 useAction 获取 checkTranscriptionStatus action
  const checkTranscriptionStatusAction = useAction(
    api.videos.checkTranscriptionStatus
  );

  // 使用 useCallback 定义 checkTranscriptionStatus 函数
  const checkTranscriptionStatus = useCallback(
    (videoId: Id<"video">) => checkTranscriptionStatusAction({ videoId }),
    [checkTranscriptionStatusAction]
  );

  useEffect(() => {
    if (video?.status === "processing") {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 10, 90);
          return video.status === "processing" ? newProgress : 100;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (video?.status === "completed") {
      setProgress(100);
    } else if (video?.status === "transcribing" && video._id) {
      const interval = setInterval(async () => {
        const result = await checkTranscriptionStatus(video._id);
        if (result.status === "completed" || result.status === "error") {
          clearInterval(interval);
        }
      }, 10000); // 每10秒检查一次

      return () => clearInterval(interval);
    }
  }, [video?.status, video?._id, checkTranscriptionStatus]);

  if (!video) {
    return <div>Loading video details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/stories")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
        </Button>

        <h1 className="text-3xl font-bold mb-6">Video Details</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status: {video.status}</h2>
          {video.status === "processing" && (
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2">
                Generating video... This may take a few minutes.
              </p>
            </div>
          )}
          {video.status === "completed" && video.videoUrl && (
            <div className="mb-4">
              <video
                src={video.videoUrl}
                controls
                className="w-full rounded-md"
              />
            </div>
          )}
          {video.status === "error" && (
            <p className="text-red-500">
              An error occurred during video generation. Please try again.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
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
          <div className="space-x-2">
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
  );
}
