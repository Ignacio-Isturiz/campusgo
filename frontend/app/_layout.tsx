import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken } from '@/src/utils/storage';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function checkSession() {
      const token = await getToken();
      if (token) {
        // Redirigir a la pantalla de carga que luego lleva al feed
        router.replace('/loading');
      }
    }
    checkSession();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
