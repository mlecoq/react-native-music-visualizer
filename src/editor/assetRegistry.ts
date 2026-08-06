import { File } from 'expo-file-system';

/**
 * JS-side registry of the raw bytes of images (artworks) and fonts. Skia
 * objects can't hop between worklet runtimes, raw bytes can: each runtime
 * decodes and caches its own SkImages/typefaces (see skiaCache.ts).
 */
const images = new Map<string, Uint8Array>();
const fonts = new Map<string, Uint8Array>();

export const registerImage = (id: string, uri: string) => {
  if (!images.has(id)) images.set(id, new File(uri).bytesSync());
};

export const registerFont = (family: string, uri: string) => {
  if (!fonts.has(family)) fonts.set(family, new File(uri).bytesSync());
};

export const getAssetBytes = () => ({
  images: Object.fromEntries(images),
  fonts: Object.fromEntries(fonts),
});

export type AssetBytes = ReturnType<typeof getAssetBytes>;
