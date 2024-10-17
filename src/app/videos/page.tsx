"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { VideoDoc, VideoStatus } from "../../../convex/types";

// 更新 Video 类型定义
type Video = Omit<VideoDoc, 'status'> & {
  storyTitle: string;
  status: string | VideoStatus;
};

// 更新：获取状态颜色的函数
function getStatusColor(status: string | VideoStatus): string {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'processing': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export default function Videos() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const videos = useQuery(api.videos.listUserVideos) as Video[] | undefined;

  // 新增：一次性获取所有预览图片 URL
  const previewImageUrls = useQuery(api.segments.getAllPreviewImageUrls);

  if (authLoading) {
    return <LoadingView />;
  }

  if (!isAuthenticated) {
    return <UnauthenticatedView />;
  }

  return (
    <div className="py-24 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white font-dancing">Your Videos</h1>
        </div>
        {videos === undefined || previewImageUrls === undefined ? (
          <LoadingView />
        ) : videos.length === 0 ? (
          <EmptyStateView />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {videos.map((video) => (
              <VideoCard 
                key={video._id} 
                video={video} 
                previewImageUrl={previewImageUrls[video.storyId]}
              />
            ))}
            <CreateVideoCard />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="py-24 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    </div>
  );
}

function UnauthenticatedView() {
  return (
    <div className="py-24 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You need to be logged in to view your videos.</h2>
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyStateView() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">You haven&apos;t created any videos yet.</h2>
      <p className="mb-4">Get started by creating your first video!</p>
      <CreateVideoCard />
    </div>
  );
}

function VideoCard({ video, previewImageUrl }: { video: Video; previewImageUrl: string | null }) {
  const [isLoading, setIsLoading] = useState(true);
  const status = video.status as VideoStatus;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="w-full h-48 relative">
        {status === "completed" && video.videoUrl ? (
          <video 
            src={video.videoUrl} 
            className="object-cover w-full h-full" 
            controls
            preload="metadata"
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
          />
        ) : (
          <Image 
            src={previewImageUrl || "/placeholder-image.png"}
            alt="Video preview"
            layout="fill"
            objectFit="cover"
            onLoadingComplete={() => setIsLoading(false)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.png";
              setIsLoading(false);
            }}
          />
        )}
        {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white ${getStatusColor(status)}`}>
          {status}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{video.storyTitle || 'Untitled Video'}</h3>
        <Link href={`/videos/${video.storyId}`}>
          <Button
            variant="outline"
            className="w-full text-blue-500 border-blue-500 hover:bg-blue-50"
            aria-label={`View details for ${video.storyTitle}`}
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

function CreateVideoCard() {
  return (
    <Link href="/generate">
      <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col items-center justify-center h-full cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:shadow-lg">
        <Plus className="w-16 h-16 text-blue-500 mb-4" />
        <p className="text-lg font-semibold text-gray-800">Create New Video</p>
      </div>
    </Link>
  );
}