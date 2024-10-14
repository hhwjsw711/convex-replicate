// src/app/stories/[storyId]/refine/page.tsx
import { RefineStoryContent } from "./refine-story-content";

export default function RefineStory() {
  return (
    <div className="min-h-screen p-4 space-y-8 py-32">
      <div className="container mx-auto">
        <RefineStoryContent />
      </div>
    </div>
  );
}