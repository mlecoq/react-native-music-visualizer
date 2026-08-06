import type { VideoComposition } from '@azzapp/react-native-skia-video';
import type { Track } from '../audio/types';

/**
 * The whole composition is ONE audio item — there are no video items at all.
 * The frames extractor still drives the clock and plays/mixes the audio;
 * every pixel comes from the drawVisualizer worklet.
 */
export const buildComposition = (track: Track): VideoComposition => ({
  duration: track.duration,
  items: [
    {
      kind: 'audio',
      id: 'track',
      path: track.uri.replace('file://', ''),
      compositionStartTime: 0,
      startTime: 0,
      duration: track.duration,
      volume: 1,
    },
  ],
});
