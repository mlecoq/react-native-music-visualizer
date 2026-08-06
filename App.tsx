import './global.css';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EditorScreen } from './src/screens/EditorScreen';

export default function App() {
  // Without a "playback" audio session, iOS mutes the app entirely while the
  // phone's ring switch is on silent — the video's soundtrack would appear
  // not to play.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // UI fonts: the Remix Icon glyph font + the caption fonts (which the
  // editor also loads as raw bytes for Skia — see editor/assets.ts).
  const [fontsLoaded] = useFonts({
    remixicon: require('remixicon/fonts/remixicon.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'ArchivoBlack-Regular': require('./assets/fonts/ArchivoBlack-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <EditorScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
