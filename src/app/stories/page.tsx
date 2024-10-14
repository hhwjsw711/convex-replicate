// src/app/stories/page.tsx
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, Pen, Video, Globe } from 'lucide-react';

export default function StoriesPage() {
  const stories = useQuery(api.story.getAllStories) || [];
  const [selectedCollection, setSelectedCollection] = useState('unassigned');
  const [selectedWorkflow, setSelectedWorkflow] = useState('draft');

  return (
    <div className="min-h-screen py-32">
      <div className="gap-8 container mx-auto items-center justify-center px-4 text-center space-y-8">
        <h1 className="text-4xl text-center font-dancing">Your Stories</h1>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full max-w-7xl mx-auto">
          <CollectionSelector 
            selectedCollection={selectedCollection} 
            setSelectedCollection={setSelectedCollection} 
          />
          <WorkflowSelector 
            selectedWorkflow={selectedWorkflow} 
            setSelectedWorkflow={setSelectedWorkflow} 
          />
        </div>
        <div className="mx-auto max-w-7xl">
          {stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <StoryCard key={story._id} storyId={story._id} />
              ))}
            </div>
          ) : (
            <NoStoriesPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function CollectionSelector({ selectedCollection, setSelectedCollection }) {
  return (
    <div className="flex flex-col items-start">
      <label htmlFor="collection-select" className="mb-2 text-sm font-medium">Select Collection</label>
      <div className="flex flex-row gap-4">
        <select
          id="collection-select"
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="w-64 px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="unassigned">Unassigned</option>
          <option value="all">All Collections</option>
        </select>
        <Link href="/generate" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white text-blue-800 border border-blue-500 hover:bg-blue-50 h-9 px-4 py-2">
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </Link>
      </div>
    </div>
  );
}

function WorkflowSelector({ selectedWorkflow, setSelectedWorkflow }) {
  return (
    <div className="flex flex-col items-start">
      <label htmlFor="workflow-tabs" className="mb-2 text-sm font-medium">Work Flow</label>
      <div 
        role="tablist" 
        aria-orientation="horizontal" 
        className="h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 grid grid-cols-3 w-full"
        id="workflow-tabs"
        tabIndex={0}
        data-orientation="horizontal"
        style={{ outline: 'none' }}
      >
        <WorkflowTab 
          icon={Pen} 
          label="In Draft" 
          value="draft" 
          selectedWorkflow={selectedWorkflow} 
          setSelectedWorkflow={setSelectedWorkflow} 
        />
        <WorkflowTab 
          icon={Video} 
          label="Unpublished" 
          value="video" 
          selectedWorkflow={selectedWorkflow} 
          setSelectedWorkflow={setSelectedWorkflow} 
        />
        <WorkflowTab 
          icon={Globe} 
          label="Published" 
          value="published" 
          selectedWorkflow={selectedWorkflow} 
          setSelectedWorkflow={setSelectedWorkflow} 
        />
      </div>
    </div>
  );
}

function WorkflowTab({ icon: Icon, label, value, selectedWorkflow, setSelectedWorkflow }) {
  const isSelected = selectedWorkflow === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`radix-:r6:-content-${value}`}
      data-state={isSelected ? 'active' : 'inactive'}
      id={`radix-:r6:-trigger-${value}`}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected ? 'bg-white text-blue-600 shadow' : 'hover:bg-gray-200'
      }`}
      tabIndex={isSelected ? 0 : -1}
      data-orientation="horizontal"
      data-radix-collection-item=""
      onClick={() => setSelectedWorkflow(value)}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );
}

function NoStoriesPlaceholder() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center space-y-4 mt-12 bg-white border border-gray-700 p-8 rounded-lg shadow-md min-h-52">
      <p className="text-lg text-gray-600">No stories yet.</p>
      <Link href="/generate" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white text-blue-800 border border-blue-500 hover:bg-blue-50 h-9 px-4 py-2">
        <Plus className="w-4 h-4 mr-2" />
        New Story
      </Link>
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
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
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