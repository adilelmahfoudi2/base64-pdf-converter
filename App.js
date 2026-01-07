import React, { useCallback, useEffect, useState, createContext } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

// Context for shared file content
export const SharedFileContext = createContext(null);

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { isDarkMode, isLoading } = useTheme();

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [sharedFileContent, setSharedFileContent] = useState(null);

  // Handle incoming file/URL
  const handleDeepLink = async (url) => {
    if (!url) return;
    
    try {
      console.log('Received URL:', url);
      
      // Check if it's a file URL
      if (url.startsWith('file://') || url.startsWith('content://')) {
        const content = await FileSystem.readAsStringAsync(url);
        if (content) {
          const cleanedContent = content.replace(/\s/g, '');
          setSharedFileContent(cleanedContent);
        }
      }
    } catch (err) {
      console.error('Error handling deep link:', err);
    }
  };

  useEffect(() => {
    // Check for initial URL (app opened via file)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await mobileAds()
          .initialize()
          .then((adapterStatuses) => {
            console.log('Mobile Ads initialized');
          })
          .catch((error) => {
            console.log('Mobile Ads initialization error:', error);
          });
      } catch (e) {
        console.warn('Error initializing app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <SharedFileContext.Provider value={{ sharedFileContent, setSharedFileContent }}>
          <ThemeProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </ThemeProvider>
        </SharedFileContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
