/** Codepoints for the Remix Icon glyphs used in the app (extracted from remixicon/fonts/remixicon.glyph.json). */
export const glyphs = {
  "play-fill": "",
  "pause-fill": "",
  "music-2-line": "",
  "music-2-fill": "",
  "text": "",
  "film-line": "",
  "magic-line": "",
  "download-2-line": "",
  "close-line": "",
  "check-line": "",
  "add-line": "",
  "image-line": "",
  "video-line": "",
  "gallery-line": "",
  "error-warning-line": "",
  "checkbox-circle-fill": "",
  "disc-line": "",
  "equalizer-line": "",
  "palette-line": "",
  "edit-line": "",
} as const;

export type IconName = keyof typeof glyphs;
