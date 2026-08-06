# Wave Studio — a music visualizer in React Native

Turn an audio track into a shareable, audio-reactive video — entirely
on-device, with **Expo**, **React Native Skia** and
[**@azzapp/react-native-skia-video**](https://github.com/AzzappApp/react-native-skia-video).
Third app of the tutorial series after
[Island Studio](https://github.com/mlecoq/react-native-video-editor) and
[Caption Studio](https://github.com/mlecoq/react-native-auto-captions): this
one flips the pipeline — the composition contains **no video at all**, every
pixel is generated from the music.

<p align="center"><em>Pick a track → choose a scene & theme → export a 1080×1920 video with the audio baked in.</em></p>

## Features

- 🎵 **3 bundled tracks** (original, synthesized) with cover art and
  precomputed per-frame analysis — try every scene instantly
- 🌀 **3 scenes**: Ring (radial spectrum around the spinning artwork), Scope
  (glowing oscilloscope + spectrum floor), Nebula (audio-reactive SkSL
  shader clouds)
- 🎨 **Themes**, custom artwork from your gallery, editable title/artist
- 📤 **Export** 1080×1920@30 with the track as the audio — rendered by the
  *same* worklet as the preview

## Running it

```sh
npm install
npx expo prebuild
npx expo run:ios      # or: npx expo run:android
```

(Native modules — Expo Go won't work.)

## How it works

### No video items, just a clock and audio

The `VideoComposition` holds a single `kind: 'audio'` item
([`composition.ts`](src/editor/composition.ts)). The frames extractor drives
the timeline and plays/mixes the track; the `frames` map handed to the
drawer is always empty. Every pixel comes from
[`drawVisualizer.ts`](src/visualizer/drawVisualizer.ts) — one worklet, used
by the preview *and* the export, so what you see is exactly what you save.

### Audio analysis is data, not DSP

Scenes never touch audio buffers. A build-time script
([`scripts/analyze-track.mjs`](scripts/analyze-track.mjs) — plain Node, a
tiny FFT included) precomputes, at 30 fps:

- smoothed **bass / mid / high** envelopes (fast attack, slow release),
- a 24-bin log-spaced **spectrum**,
- a 48-point **waveform** snapshot.

The JSON ships next to each track (~230 KB) and the worklet just indexes it:

```ts
const frame = analysisAt(track.analysis, currentTime);
// { bass: 0.82, mid: 0.4, high: 0.13, spectrum: [...24], wave: [...48] }
```

Deterministic input → deterministic render: scenes are pure functions of
`(time, analysisFrame, theme)`, which is also why preview and export can't
drift apart. To analyze your own tracks:
`node scripts/analyze-track.mjs song.m4a > song.analysis.json`.

### The scenes

All in [`scenes.ts`](src/visualizer/scenes.ts):

- **Ring** — 48 rounded bars (the 24 bins mirrored) around the artwork,
  rotating slowly; the disc spins like a vinyl and scales with the bass; a
  radial-gradient halo breathes behind it.
- **Scope** — the waveform drawn twice (a blurred glow pass under a crisp
  core pass), spectrum bars along the floor.
- **Nebula** — a full-screen **SkSL runtime shader**: domain-warped fbm
  noise where the bass deepens the warp, mids blend the second color and
  highs flash the highlights. The audio bands are just shader uniforms.

Skia objects are cached per worklet runtime — compiled shader, decoded
artwork, laid-out paragraphs ([`skiaCache.ts`](src/editor/skiaCache.ts));
artwork/fonts travel between runtimes as raw bytes.

## Bundled assets

Tracks are synthesized (no samples), covers are generated vector art — all
free to reuse. Fonts (Poppins, Archivo Black) under the
[SIL OFL](assets/fonts/OFL.txt); icons [Remix Icon](https://remixicon.com/)
(Apache 2.0).

## Credits

Built on [@azzapp/react-native-skia-video](https://github.com/AzzappApp/react-native-skia-video)
([documentation](https://azzappapp.github.io/react-native-skia-video/)).

MIT — see [LICENSE](LICENSE).
