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

type VideoData = {
  script: string;
  isVertical: boolean;
  audioUrl?: string;
  transcriptionWords?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  segments: Array<{
    text: string;
    imageUrl?: string; // 将 image 改为 imageUrl
    order: number;
  }>;
};

export const RemotionVideo: React.FC<{ videoData: VideoData; fps: number }> = ({
  videoData,
  fps,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { audioUrl, segments, transcriptionWords } = videoData;

  // 使用传入的 fps 计算 durationInFrames
  const calculatedDurationInFrames = useMemo(() => {
    if (!transcriptionWords || transcriptionWords.length === 0) {
      return 0; // 或者设置一个默认的帧数
    }

    const lastWord = transcriptionWords[transcriptionWords.length - 1];
    return Math.ceil((lastWord.end / 1000) * fps);
  }, [transcriptionWords, fps]);

  // 使用计算得到的 durationInFrames，而不是从 useVideoConfig 获取的
  const effectiveDurationInFrames =
    calculatedDurationInFrames || durationInFrames;

  const currentTime = (frame / fps) * 1000; // 将当前时间转换为毫秒

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

        // 简单的放大缩小效果
        const scale = interpolate(
          progress,
          [0, 0.5, 1],
          [1, 1.05, 1], // 最大放大到1.05倍，可以根据需要调整
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // 淡入淡出效果
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
                    fontSize: "32px",
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
