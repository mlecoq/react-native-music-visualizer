import { exportVideoComposition, getValidEncoderConfigurations } from '@azzapp/react-native-skia-video';
import { Paths } from 'expo-file-system';
import { Asset as MediaAsset, requestPermissionsAsync } from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import type { Track, VisualizerSettings } from '../audio/types';
import { drawVisualizer } from '../visualizer/drawVisualizer';
import { getAssetBytes } from './assetRegistry';
import { buildComposition } from './composition';

const WIDTH = 1080;
const HEIGHT = 1920;
const FRAME_RATE = 30;
const BIT_RATE = 8_000_000;

export type ExportPhase = 'idle' | 'rendering' | 'saving' | 'done' | 'error';

/**
 * Renders the visualizer to a 1080x1920 MP4 with the track as its audio and
 * saves it to the photo library — the exact same drawVisualizer worklet as
 * the preview, replayed frame-perfect on a background thread.
 */
export const useExport = (track: Track | null, settings: VisualizerSettings) => {
  const [phase, setPhase] = useState<ExportPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (!track) return;
    try {
      const permission = await requestPermissionsAsync(true);
      if (!permission.granted) {
        throw new Error('Permission to save to the photo library was denied.');
      }
      setPhase('rendering');
      setProgress(0);

      const encoderConfig =
        Platform.OS === 'android'
          ? getValidEncoderConfigurations(WIDTH, HEIGHT, FRAME_RATE, BIT_RATE)?.[0]
          : null;

      // Snapshots captured by the export worklet: plain data + raw bytes.
      const snapshotTrack = track;
      const snapshotSettings = settings;
      const assets = getAssetBytes();

      const outPath = `${Paths.cache.uri}visualizer-${Date.now()}.mp4`.replace('file://', '');
      await exportVideoComposition({
        videoComposition: buildComposition(track),
        outPath,
        width: encoderConfig?.width ?? WIDTH,
        height: encoderConfig?.height ?? HEIGHT,
        frameRate: encoderConfig?.frameRate ?? FRAME_RATE,
        bitRate: encoderConfig?.bitRate ?? BIT_RATE,
        encoderName: encoderConfig?.encoderName,
        drawFrame: ({ canvas, width, height, currentTime }) => {
          'worklet';
          drawVisualizer({
            canvas,
            width,
            height,
            currentTime,
            track: snapshotTrack,
            settings: snapshotSettings,
            assets,
          });
        },
        // One scheduled state update per frame is thousands over a full
        // song — enough to starve the JS thread and freeze the progress
        // bar at 0%. Only commit whole-percent changes; returning the
        // previous value lets React bail out of the render entirely.
        onProgress: ({ framesCompleted, nbFrames }) =>
          setProgress((previous) => {
            const next = framesCompleted / nbFrames;
            return Math.round(next * 100) > Math.round(previous * 100) ? next : previous;
          }),
      });

      setPhase('saving');
      await MediaAsset.create(`file://${outPath}`);
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
      setPhase('error');
    }
  }, [track, settings]);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { phase, progress, error, start, reset };
};
