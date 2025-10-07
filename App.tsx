import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { RecordingsProvider } from './src/context/RecordingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import NetInfo from '@react-native-community/netinfo';
import { settingsStorage } from './src/storage/settingsStorage';

export default function App() {
  const colorScheme = useColorScheme();
  const [isOffline, setIsOffline] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    // Load theme preference
    settingsStorage.getTheme().then(setTheme);

    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const getTheme = () => {
    if (theme === 'auto') {
      return colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
    }
    return theme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  };

  const paperTheme = {
    ...getTheme(),
    colors: {
      ...getTheme().colors,
      primary: '#6200ee',
      secondary: '#03dac4',
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <RecordingsProvider>
          <NavigationContainer>
            {isOffline && (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineText}>
                  📵 Offline Mode - All features available
                </Text>
              </View>
            )}
            <AppNavigator />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </NavigationContainer>
        </RecordingsProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#03dac4',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
