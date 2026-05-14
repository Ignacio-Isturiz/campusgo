import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken } from '@/src/utils/storage';
import { getPreferences } from '@/src/utils/storage';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [prefTheme, setPrefTheme] = React.useState<'light' | 'dark' | null>(null);

  React.useEffect(() => {
    (async () => {
      const prefs = await getPreferences();
      if (prefs && prefs.theme) setPrefTheme(prefs.theme as any);
    })();
  }, []);

  useEffect(() => {
    async function checkSession() {
      const token = await getToken();
      if (!token) return;

      // Verify token with backend to ensure it's valid before redirecting
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          // token valid, continue to loading which will route to last route
          const data = await res.json();
          try {
            const m = await import('@/src/utils/storage');
            if (data.user) {
              await m.saveUser(data.user);
              if (data.user.photoUrl) {
                await m.savePhoto(data.user.photoUrl);
              }
            }
          } catch (e) {
            // ignore storage errors
          }
          router.replace('/loading');
          return;
        }

        // invalid token -> remove stored token so user sees login screen
        await import('@/src/utils/storage').then((m) => m.deleteToken());
      } catch (error) {
        // on network errors we keep the token and still proceed to loading
        // to allow offline/unstable networks to continue using the app
        console.warn('Token verification failed, proceeding without clearing token:', error);
        router.replace('/loading');
      }
    }

    checkSession();
  }, []);

  return (
    <ThemeProvider value={(prefTheme || colorScheme) === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Pantalla de autenticación */}
        <Stack.Screen name="index" />
        
        {/* Pantalla de transición/carga elegante */}
        <Stack.Screen 
          name="loading" 
          options={{ animationEnabled: false }}
        />
        
        {/* Pantalla de modal */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        
        {/* Navegación con tabs (Home feed + Explore) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
