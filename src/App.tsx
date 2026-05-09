import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/auth';
import { ToastProvider } from '@components/index';
import { setupI18n } from '@i18n/index';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './theme/ThemeContext';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setupI18n().finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
