import { useEffect, useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { runOnUI } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SceneId, Track, VisualizerSettings } from '../audio/types';
import { ExportSheet } from '../components/sheets/ExportSheet';
import { SceneSheet } from '../components/sheets/SceneSheet';
import { ThemeSheet } from '../components/sheets/ThemeSheet';
import { TitleSheet } from '../components/sheets/TitleSheet';
import { TrackSheet } from '../components/sheets/TrackSheet';
import { Button } from '../components/ui/button';
import { Icon, type IconName } from '../components/ui/icon';
import { Text } from '../components/ui/text';
import { VisualizerPreview } from '../components/VisualizerPreview';
import { getAssetBytes } from '../editor/assetRegistry';
import { loadEditorFonts } from '../editor/assets';
import { primeSkiaCaches } from '../editor/skiaCache';
import { useExport } from '../editor/useExport';

type SheetId = 'track' | 'scene' | 'theme' | 'title' | 'export' | null;

/** Decodes newly registered images/fonts into the preview (UI) runtime. */
const primePreviewRuntime = () => runOnUI(primeSkiaCaches)(getAssetBytes());

export const EditorScreen = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [settings, setSettings] = useState<VisualizerSettings>({
    scene: 'ring',
    themeId: 'lagoon',
    title: '',
    artist: '',
  });
  const [sheet, setSheet] = useState<SheetId>(null);
  const exporter = useExport(track, settings);

  useEffect(() => {
    loadEditorFonts().then(primePreviewRuntime);
  }, []);

  const selectTrack = (nextTrack: Track) => {
    primePreviewRuntime(); // the track's cover was just registered
    setTrack(nextTrack);
    setSettings((s) => ({ ...s, title: nextTrack.title, artist: nextTrack.artist }));
  };

  const swapCover = (coverId: string) => {
    primePreviewRuntime();
    setTrack((t) => (t ? { ...t, coverId } : t));
  };

  const window = useWindowDimensions();
  const previewSize = useMemo(() => {
    const height = Math.min(window.height * 0.6, ((window.width - 40) * 16) / 9);
    return { width: Math.round((height * 9) / 16), height: Math.round(height) };
  }, [window.width, window.height]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-2">
        <Text className="text-xl">
          Wave <Text className="text-xl text-accent">Studio</Text>
        </Text>
        <Button size="sm" onPress={() => setSheet('export')} disabled={!track}>
          <Icon name="download-2-line" size={16} color="#05201C" />
          <Text>Export</Text>
        </Button>
      </View>

      <View className="flex-1 items-center justify-center">
        {track ? (
          <VisualizerPreview track={track} settings={settings} size={previewSize} />
        ) : (
          <View
            className="items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border px-8"
            style={previewSize}
          >
            <Icon name="equalizer-line" size={40} color="#8A94A6" />
            <Text className="text-center text-sm text-muted">
              Turn a track into a shareable,{'\n'}audio-reactive video
            </Text>
            <Button onPress={() => setSheet('track')}>
              <Icon name="music-2-line" size={18} color="#05201C" />
              <Text>Choose a track</Text>
            </Button>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-around border-t border-border bg-surface px-2 pb-1 pt-3">
        <ToolButton icon="disc-line" label="Track" onPress={() => setSheet('track')} />
        <ToolButton icon="equalizer-line" label="Scene" disabled={!track} onPress={() => setSheet('scene')} />
        <ToolButton icon="palette-line" label="Theme" disabled={!track} onPress={() => setSheet('theme')} />
        <ToolButton icon="text" label="Title" disabled={!track} onPress={() => setSheet('title')} />
      </View>

      <TrackSheet
        visible={sheet === 'track'}
        onClose={() => setSheet(null)}
        current={track}
        onSelect={selectTrack}
        onCoverChange={swapCover}
      />
      <SceneSheet
        visible={sheet === 'scene'}
        onClose={() => setSheet(null)}
        current={settings.scene}
        onSelect={(scene: SceneId) => setSettings((s) => ({ ...s, scene }))}
      />
      <ThemeSheet
        visible={sheet === 'theme'}
        onClose={() => setSheet(null)}
        current={settings.themeId}
        onSelect={(themeId) => setSettings((s) => ({ ...s, themeId }))}
      />
      <TitleSheet
        visible={sheet === 'title'}
        onClose={() => setSheet(null)}
        title={settings.title}
        artist={settings.artist}
        onSubmit={(title, artist) => setSettings((s) => ({ ...s, title, artist }))}
      />
      <ExportSheet visible={sheet === 'export'} onClose={() => setSheet(null)} exporter={exporter} />
    </SafeAreaView>
  );
};

const ToolButton = ({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className={`min-w-16 items-center gap-1 px-2 active:opacity-70 ${disabled ? 'opacity-40' : ''}`}
  >
    <Icon name={icon} size={22} />
    <Text className="text-xs text-muted">{label}</Text>
  </Pressable>
);
