"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

enum DialogType {
  None,
  Refine,
  GenerateSegments,
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return debounced as T & { cancel: () => void };
}

function countWordsAndCharacters(text: string): {
  wordCount: number;
  characterCount: number;
} {
  const words = text.match(/[\u4e00-\u9fa5]|\b[a-z0-9']+\b/gi) || [];
  const characterCount = text.trim().length;
  return { wordCount: words.length, characterCount };
}

function estimateVideoLength(text: string): {
  length: string;
  wordCount: number;
  characterCount: number;
} {
  const { wordCount, characterCount } = countWordsAndCharacters(text);

  // 定义不同语言的每分钟单词/字符数
  const wordsPerMinute: { [key: string]: number } = {
    en: 150, // 英语
    zh: 200, // 中文
    default: 150, // 默认值
  };

  // 语言检测函数
  function detectLanguage(word: string): string {
    if (/[\u4e00-\u9fa5]/.test(word)) return "zh";
    return "en"; // 简化处理，将所有非中文字符视为英语
  }

  let totalTime = 0;
  const words = text.match(/[\u4e00-\u9fa5]|\b[a-z0-9']+\b/gi) || [];
  words.forEach((word) => {
    const lang = detectLanguage(word);
    totalTime += 1 / wordsPerMinute[lang];
  });

  const minutes = totalTime;

  let length: string;
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    length = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  } else if (minutes < 60) {
    length = `${minutes.toFixed(1)} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    length = `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
  }

  return { length, wordCount, characterCount };
}

export function RefineStoryContent() {
  const params = useParams();
  const storyId = params.storyId as Id<"story">;
  const story = useQuery(api.story.getStory, { storyId });
  const [isVertical, setIsVertical] = useState(true);
  const [openDialog, setOpenDialog] = useState<DialogType>(DialogType.None);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const updateStoryScript = useMutation(
    api.guidedStory.updateStoryScriptPublic
  );
  const generateSegments = useMutation(
    api.guidedStory.generateSegmentsMutation
  );
  const lastStatus = useRef(story?.status);

  const [isUnsaved, setIsUnsaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedUpdate = useCallback(
    debounce((newScript: string) => {
      updateStoryScript({ storyId, script: newScript });
      setIsUnsaved(false);
    }, 500),
    [storyId, updateStoryScript]
  );

  const handleScriptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newScript = e.target.value;
      setIsUnsaved(true);
      debouncedUpdate(newScript);
    },
    [debouncedUpdate, setIsUnsaved]
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    if (lastStatus.current === "processing" && story?.status === "completed") {
      if (textareaRef.current) {
        textareaRef.current.value = story.script;
      }
    }
    lastStatus.current = story?.status;
  }, [story]);

  if (!story) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  const handleGenerateSegments = async () => {
    setIsGenerating(true);
    try {
      await generateSegments({ storyId, isVertical });
      setOpenDialog(DialogType.None);
      router.push(`/stories/${storyId}`);
    } catch (error) {
      console.error("Failed to generate segments:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const {
    length: estimatedVideoLength,
    wordCount,
    characterCount,
  } = estimateVideoLength(story.script);

  const estimatedSegments = story.script.split(/\n{2,}/).length;
  const estimatedCredits = estimatedSegments * 10;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-4xl space-y-8 relative z-10 py-32">
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold text-white text-center leading-tight">
          Refine Your Story
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {story.title}
          </h2>
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <textarea
              ref={textareaRef}
              className="w-full min-h-[400px] resize-none focus:outline-none text-gray-800"
              defaultValue={story.script}
              onChange={handleScriptChange}
              disabled={story.status === "processing"}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>
              {wordCount} words / {characterCount} characters
            </span>
            <span>Estimated video length: {estimatedVideoLength}</span>
          </div>
          {isUnsaved && (
            <p className="text-sm text-gray-500 mt-2">Unsaved changes</p>
          )}
          <div className="flex justify-between space-x-4 mt-4">
            <Button
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              variant="outline"
              onClick={() => setOpenDialog(DialogType.Refine)}
            >
              Refine Story
            </Button>
            <Button
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              variant="outline"
              onClick={() => setOpenDialog(DialogType.GenerateSegments)}
            >
              Generate Segments
            </Button>
          </div>
          <Dialog
            open={openDialog !== DialogType.None}
            onOpenChange={(open) => !open && setOpenDialog(DialogType.None)}
          >
            <DialogContent className="sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] max-h-[80vh] overflow-y-auto bg-white">
              {openDialog === DialogType.Refine && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-md font-bold text-gray-900 mb-8">
                      Refine Your Story
                    </DialogTitle>
                    <DialogDescription className="text-gray-900">
                      Enter your refinement instructions. This will cost 1
                      credit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input
                        id="refine-instructions"
                        placeholder="Enter refinement instructions..."
                        className="col-span-3 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-8">
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-gray-700 bg-gray-200 hover:bg-gray-300 mr-2"
                      onClick={() => setOpenDialog(DialogType.None)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Refine (1 credit)
                    </Button>
                  </DialogFooter>
                </>
              )}
              {openDialog === DialogType.GenerateSegments && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-md font-bold text-gray-900 mb-8">
                      Choose Video Orientation
                    </DialogTitle>
                    <DialogDescription className="text-gray-900 space-y-2">
                      <span className="block">
                        Vertical videos are ideal for platforms like TikTok and
                        Instagram Reels.
                      </span>
                      <span className="block">
                        Horizontal videos are better suited for YouTube and
                        traditional video players.
                      </span>
                      <span className="block font-bold">
                        Note: Once set, the orientation cannot be changed
                        without regenerating all images, so choose carefully!
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-between space-x-4 mt-4">
                    <Button
                      className={cn(
                        "flex-1 px-4 py-2 rounded transition-colors",
                        isVertical
                          ? "text-white bg-blue-600 hover:bg-blue-700"
                          : "text-gray-900 bg-gray-200 hover:bg-gray-300"
                      )}
                      onClick={() => setIsVertical(true)}
                    >
                      Vertical
                    </Button>
                    <Button
                      className={cn(
                        "flex-1 px-4 py-2 rounded transition-colors",
                        isVertical
                          ? "text-gray-900 bg-gray-200 hover:bg-gray-300"
                          : "text-white bg-blue-600 hover:bg-blue-700"
                      )}
                      onClick={() => setIsVertical(false)}
                    >
                      Horizontal
                    </Button>
                  </div>
                  <DialogFooter className="mt-8">
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-gray-700 bg-gray-200 hover:bg-gray-300 mr-2"
                      onClick={() => setOpenDialog(DialogType.None)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="text-white bg-blue-600 rounded hover:bg-blue-700"
                      onClick={handleGenerateSegments}
                      disabled={isGenerating}
                    >
                      {isGenerating
                        ? "Generating..."
                        : `Generate (${estimatedCredits} credits)`}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
