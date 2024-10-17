import React from 'react';
import {Composition} from 'remotion';
import {RemotionVideo} from '@/app/videos/[storyId]/remotion-video';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RemotionVideo"
      component={RemotionVideo}
      durationInFrames={30 * 30} // 这个值会在实际渲染时被覆盖
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
  );
};