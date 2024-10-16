import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  Sequence,
} from "remotion";
import { VideoData } from "../../../../convex/types";

export const RemotionVideo: React.FC<{ videoData: VideoData; fps: number }> = ({
  videoData,
  fps,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { isVertical, audioUrl, transcriptionWords, segments } = videoData;

  const calculatedDurationInFrames = useMemo(() => {
    if (!transcriptionWords || transcriptionWords.length === 0) {
      return 0;
    }

    const lastWord = transcriptionWords[transcriptionWords.length - 1];
    return Math.ceil((lastWord.end / 1000) * fps);
  }, [transcriptionWords, fps]);

  const effectiveDurationInFrames =
    calculatedDurationInFrames || durationInFrames;

  const currentTime = (frame / fps) * 1000;

  const currentSubtitle = useMemo(() => {
    if (!transcriptionWords) return "";

    const currentWord = transcriptionWords.find(
      (word) => currentTime >= word.start && currentTime <= word.end
    );

    return currentWord ? currentWord.text : "";
  }, [transcriptionWords, currentTime]);

  return (
    <AbsoluteFill className="bg-black">
      {audioUrl && <Audio src={audioUrl} />}

      {segments.map((segment, index) => {
        const segmentDuration = effectiveDurationInFrames / segments.length;
        const segmentStart = index * segmentDuration;
        const sequenceFrame = frame - segmentStart;
        const progress = sequenceFrame / segmentDuration;

        const scale = interpolate(progress, [0, 0.5, 1], [1, 1.05, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <Sequence
            key={index}
            from={segmentStart}
            durationInFrames={segmentDuration}
          >
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {segment.imageUrl && (
                  <Img
                    src={segment.imageUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: `scale(${scale})`,
                      opacity,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    padding: "20px",
                    fontSize: isVertical ? "24px" : "32px",
                    textAlign: "center",
                    lineHeight: "1.4",
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentSubtitle}
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
