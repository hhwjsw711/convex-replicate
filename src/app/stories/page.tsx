"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

export default function StoriesPage() {
  const stories = useQuery(api.story.getAllStories) || [];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Your Stories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <StoryCard key={story._id} storyId={story._id} />
          ))}
          <CreateNewStoryCard />
        </div>
      </div>
    </div>
  );
}

function StoryCard({ storyId }: { storyId: Id<"story"> }) {
  const story = useQuery(api.story.getStory, { storyId });
  const firstSegment = useQuery(api.segments.getFirstSegment, { storyId });
  const previewImageUrl = useQuery(
    api.segments.getImageUrl, 
    firstSegment?.previewImage ? { storageId: firstSegment.previewImage } : "skip"
  );

  if (!story) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative aspect-video">
        {previewImageUrl ? (
          <Image
            src={previewImageUrl}
            alt={story.title}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No preview available</span>
          </div>
        )}
        <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-white bg-opacity-75 rounded text-sm text-gray-900">
          {story.status}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">{story.title}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{firstSegment?.text}</p>
        <Link 
          href={`/stories/${storyId}`} 
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
        >
          View Story
        </Link>
      </div>
    </div>
  );
}

function CreateNewStoryCard() {
  return (
    <Link 
      href="/generate/guided" 
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
    >
      <div className="relative aspect-video w-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div className="p-4 w-full">
        <h2 className="text-xl font-semibold text-gray-800 text-center">Create New Story</h2>
      </div>
    </Link>
  );
}