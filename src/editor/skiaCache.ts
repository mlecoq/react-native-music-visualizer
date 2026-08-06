import { Skia, TextAlign } from '@shopify/react-native-skia';
import type {
  SkImage,
  SkParagraph,
  SkRuntimeEffect,
  SkTypefaceFontProvider,
} from '@shopify/react-native-skia';
import type { AssetBytes } from './assetRegistry';

/**
 * Per-runtime caches of decoded Skia objects (images, fonts, paragraphs,
 * compiled shaders). Every function is a worklet and may run on the JS
 * thread, the UI thread (preview) or the export thread; each runtime keeps
 * its own cache on `globalThis`.
 *
 * NOTE: helpers are defined before their callers — worklet closures are
 * captured at the definition site.
 */

type Cache = {
  images: Record<string, SkImage>;
  fontProvider: SkTypefaceFontProvider | null;
  paragraphs: Record<string, SkParagraph>;
  paragraphKeys: string[];
  effects: Record<string, SkRuntimeEffect>;
};

const getCache = (): Cache => {
  'worklet';
  const holder = globalThis as { __waveCache?: Cache };
  holder.__waveCache ??= {
    images: {},
    fontProvider: null,
    paragraphs: {},
    paragraphKeys: [],
    effects: {},
  };
  return holder.__waveCache;
};

/** Decodes registered images and fonts into this runtime's cache. */
export const primeSkiaCaches = (assets: AssetBytes) => {
  'worklet';
  const cache = getCache();
  for (const [id, bytes] of Object.entries(assets.images)) {
    if (cache.images[id]) continue;
    const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(bytes));
    if (image) cache.images[id] = image;
  }
  if (!cache.fontProvider) {
    const provider = Skia.TypefaceFontProvider.Make();
    for (const [family, bytes] of Object.entries(assets.fonts)) {
      const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(Skia.Data.fromBytes(bytes));
      if (typeface) provider.registerFont(typeface, family);
    }
    cache.fontProvider = provider;
  }
};

export const getCachedImage = (id: string): SkImage | null => {
  'worklet';
  return getCache().images[id] ?? null;
};

/** Compiles (once per runtime) an SkSL runtime effect. */
export const getEffect = (key: string, sksl: string): SkRuntimeEffect => {
  'worklet';
  const cache = getCache();
  if (!cache.effects[key]) {
    const effect = Skia.RuntimeEffect.Make(sksl);
    if (!effect) throw new Error(`Failed to compile shader "${key}"`);
    cache.effects[key] = effect;
  }
  return cache.effects[key]!;
};

/** Cached single-style paragraph (title/artist lines). */
export const getParagraph = (
  text: string,
  family: string,
  fontSize: number,
  color: string,
  layoutWidth: number
): SkParagraph | null => {
  'worklet';
  const cache = getCache();
  if (!cache.fontProvider) return null;
  const key = `${text}|${family}|${fontSize.toFixed(1)}|${color}|${layoutWidth.toFixed(0)}`;
  const cached = cache.paragraphs[key];
  if (cached) return cached;

  const builder = Skia.ParagraphBuilder.Make(
    { textAlign: TextAlign.Center, maxLines: 2 },
    cache.fontProvider
  );
  builder.pushStyle({
    fontFamilies: [family],
    fontSize,
    color: Skia.Color(color),
    shadows: [
      { color: Skia.Color('#00000088'), offset: { x: 0, y: fontSize * 0.05 }, blurRadius: fontSize * 0.2 },
    ],
  });
  builder.addText(text);
  const paragraph = builder.build();
  paragraph.layout(layoutWidth);

  cache.paragraphs[key] = paragraph;
  cache.paragraphKeys.push(key);
  if (cache.paragraphKeys.length > 24) {
    const evicted = cache.paragraphKeys.shift()!;
    cache.paragraphs[evicted]?.dispose();
    delete cache.paragraphs[evicted];
  }
  return paragraph;
};
