import { Asset } from 'expo-asset';
import { analyzeTrack } from '../audio/analyzeTrack';
import type { Track, TrackAnalysis } from '../audio/types';
import { registerImage } from './assetRegistry';
import { registerFontFile } from './fonts';

/**
 * Bundled content: three original synthesized tracks, each with its cover
 * art and its precomputed analysis (see scripts/analyze-track.mjs), plus the
 * fonts. Analysis JSONs are bundled by Metro like any module.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
type TrackMeta = {
  id: string;
  title: string;
  artist: string;
  audio: number;
  cover: number;
  analysis: TrackAnalysis;
};

export const TRACKS: TrackMeta[] = [
  {
    id: 'island-breeze',
    title: 'Island Breeze',
    artist: 'Kalimba · laid-back',
    audio: require('../../assets/music/island-breeze.m4a'),
    cover: require('../../assets/covers/island-breeze.jpg'),
    analysis: require('../../assets/music/island-breeze.analysis.json'),
  },
  {
    id: 'sunset-drift',
    title: 'Sunset Drift',
    artist: 'Lo-fi · dreamy',
    audio: require('../../assets/music/sunset-drift.m4a'),
    cover: require('../../assets/covers/sunset-drift.jpg'),
    analysis: require('../../assets/music/sunset-drift.analysis.json'),
  },
  {
    id: 'tide-groove',
    title: 'Tide Groove',
    artist: 'Marimba · upbeat',
    audio: require('../../assets/music/tide-groove.m4a'),
    cover: require('../../assets/covers/tide-groove.jpg'),
    analysis: require('../../assets/music/tide-groove.analysis.json'),
  },
];

const FONT_FILES: Record<string, number> = {
  poppins: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  archivo: require('../../assets/fonts/ArchivoBlack-Regular.ttf'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

const localUri = async (module: number) => {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  return asset.localUri!;
};

/** Resolves a bundled track: audio file + cover bytes into the registry. */
export const loadTrack = async (meta: TrackMeta): Promise<Track> => {
  const [uri, coverUri] = await Promise.all([localUri(meta.audio), localUri(meta.cover)]);
  const coverId = `cover-${meta.id}`;
  registerImage(coverId, coverUri);
  return {
    id: meta.id,
    title: meta.title,
    artist: meta.artist,
    uri,
    duration: meta.analysis.duration,
    coverId,
    analysis: meta.analysis,
  };
};

/**
 * A song from the user's own library: decoded and analyzed on-device
 * (see audio/analyzeTrack.ts) into the exact shape the bundled JSONs have.
 * No artwork until the user picks one — the scenes handle a null cover.
 */
export const loadCustomTrack = async (
  uri: string,
  filename: string,
  onProgress?: (fraction: number) => void
): Promise<Track> => {
  const analysis = await analyzeTrack(uri, onProgress);
  return {
    id: `custom-${hashUri(uri)}`,
    title: filename.replace(/\.[^.]+$/, ''),
    artist: 'From your library',
    uri,
    duration: analysis.duration,
    coverId: '',
    analysis,
  };
};

const hashUri = (uri: string): string => {
  let hash = 5381;
  for (let i = 0; i < uri.length; i++) hash = ((hash << 5) + hash + uri.charCodeAt(i)) >>> 0;
  return hash.toString(36);
};

/** Replaces a track's artwork with an image from the gallery. */
export const registerCustomCover = (trackId: string, uri: string): string => {
  const coverId = `cover-custom-${trackId}-${Date.now()}`;
  registerImage(coverId, uri);
  return coverId;
};

export const loadEditorFonts = async () => {
  for (const [family, module] of Object.entries(FONT_FILES)) {
    registerFontFile(family, await localUri(module));
  }
};
