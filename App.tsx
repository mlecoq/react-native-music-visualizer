import './global.css';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EditorScreen } from './src/screens/EditorScreen';

export default function App() {
  // UI fonts: the Remix Icon glyph font + the caption fonts (which the
  // editor also registers into the Skia font provider — see editor/assets.ts).
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
