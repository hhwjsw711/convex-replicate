"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from 'next/link';
import { Doc } from "../../../convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// 定义 Video 类型
type Video = Doc<"video"> & { storyTitle: string };

export default function Videos() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const videos = useQuery(api.videos.listUserVideos);

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
        {videos === undefined ? (
          <LoadingView />
        ) : videos.length === 0 ? (
          <EmptyStateView />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
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
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Log In
            </button>
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

function VideoCard({ video }: { video: Video }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="aspect-w-16 aspect-h-9">
        {video.status === "completed" && video.videoUrl ? (
          <video 
            src={video.videoUrl} 
            className="object-cover w-full h-full" 
            controls
            preload="metadata"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-500">
              {video.status === "processing" ? "Video is processing" : "Video not available"}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{video.storyTitle || 'Unknown Title'}</h3>
        <p className="text-sm text-gray-600 mb-4">Status: {video.status}</p>
        <Link href={`/videos/${video.storyId}`}>
          <Button variant="outline" className="w-full text-blue-500 border-blue-500 hover:bg-blue-50">View Details</Button>
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
