import React from 'react';
import {Composition} from 'remotion';
import {RemotionVideo} from '@/app/videos/[storyId]/remotion-video';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoPlayer"
        component={RemotionVideo}
        durationInFrames={30 * 30} // 设置一个默认时长，例如30秒
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoData: {
            script: "",
            isVertical: false,
            audioUrl: "",
            transcriptionWords: [],
            segments: [],
          },
          fps: 30
        }}
      />
    </>
  );
};