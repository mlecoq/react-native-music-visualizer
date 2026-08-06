import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, View } from 'react-native';
import type { Track } from '../../audio/types';
import { loadTrack, registerCustomCover, TRACKS } from '../../editor/assets';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Sheet } from '../ui/sheet';
import { Text } from '../ui/text';

/** Pick a bundled track, or swap the artwork for one from the gallery. */
export const TrackSheet = ({
  visible,
  onClose,
  current,
  onSelect,
  onCoverChange,
}: {
  visible: boolean;
  onClose: () => void;
  current: Track | null;
  onSelect: (track: Track) => void;
  onCoverChange: (coverId: string) => void;
}) => {
  const pickCustomCover = async () => {
    if (!current) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
    const asset = result.assets?.[0];
    if (!asset) return;
    onCoverChange(registerCustomCover(current.id, asset.uri));
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Track">
      {TRACKS.map((meta) => {
        const selected = current?.id === meta.id;
        return (
          <Pressable
            key={meta.id}
            onPress={async () => {
              onSelect(await loadTrack(meta));
              onClose();
            }}
            className={`mb-2 flex-row items-center gap-3 rounded-2xl border p-3 active:opacity-80 ${
              selected ? 'border-accent bg-accent/10' : 'border-border bg-surface-2'
            }`}
          >
            <Image source={meta.cover} className="h-14 w-14 rounded-xl" resizeMode="cover" />
            <View className="flex-1">
              <Text>{meta.title}</Text>
              <Text className="text-xs text-muted">
                {meta.artist} · {Math.round(meta.analysis.duration)}s
              </Text>
            </View>
            {selected && <Icon name="check-line" size={20} color="#2DD4BF" />}
          </Pressable>
        );
      })}
      {current && (
        <Button variant="secondary" className="mt-2" onPress={pickCustomCover}>
          <Icon name="gallery-line" size={18} />
          <Text>Use your own artwork</Text>
        </Button>
      )}
    </Sheet>
  );
};
