"use client";

/* import VideoList from "./video-list";
import { AuthWrapper } from "@/components/auth-wrapper"; */

export default function Videos() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white min-h-screen">
      <div className="gap-12 container mx-auto flex flex-col px-4 text-center py-32">
        <h1 className="text-5xl font-bold text-center text-white font-dancing">
          Your Videos
        </h1>
        {/* <AuthWrapper
          loadingMessage="Initializing Authentication"
          unauthorizedMessage="You need to be logged in to view your videos."
        >
          <VideoList />
        </AuthWrapper> */}
      </div>
    </div>
  );
}
