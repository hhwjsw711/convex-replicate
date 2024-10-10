"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Doc } from "../../../../convex/_generated/dataModel";

export default function StoryOverview() {
  const [isVertical, setIsVertical] = useState(false);
  const params = useParams();
  const storyId = params.storyId as Id<"story">;

  const story = useQuery(api.story.getStory, { storyId: storyId });

  if (story === undefined) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (story === null) {
    return <div className="text-center py-10">Story not found</div>;
  }

  const segments = story.segments || [];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">{story.title}</h1>
        <div className="flex justify-end mb-4">
          <button
            className={`px-4 py-2 rounded ${isVertical ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}
            onClick={() => setIsVertical(!isVertical)}
          >
            {isVertical ? "Horizontal" : "Vertical"}
          </button>
        </div>
        {segments.length === 0 ? (
          <div className="text-center py-10">
            This story has no segments. Please wait for the segments to be
            generated.
          </div>
        ) : (
          <div
            className={`grid ${isVertical ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"} gap-8`}
          >
            {segments.map((segment, index) => (
              <SegmentCard key={segment._id} segment={segment} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SegmentCard({
  segment,
  index,
}: {
  segment: Doc<"segments">;
  index: number;
}) {
  const previewImageUrl = useQuery(
    api.segments.getImageUrl,
    segment.previewImage ? { storageId: segment.previewImage } : "skip"
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Segment {index + 1}
        </h2>
        <div className="relative h-48 mb-4">
          {previewImageUrl ? (
            <Image
              src={previewImageUrl}
              alt={`Segment ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <p className="text-gray-600">No image</p>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4">{segment.text}</p>
        <div className="flex justify-end items-center">
          <span className="text-sm text-gray-500">
            {segment.text.split(/\s+/).length} / 750
          </span>
        </div>
      </div>
    </div>
  );
}
