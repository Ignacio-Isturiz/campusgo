import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Tabs, Slot, Link, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken, getUser } from '@/src/utils/storage';

const ALL_SCREENS = [
  { name: 'feed', title: 'feed', icon: 'newspaper-outline', iconFocused: 'newspaper', roles: ['admin', 'bienestar', 'estudiante'] },
  { name: 'marketplace', title: 'marketplace', icon: 'storefront-outline', iconFocused: 'storefront', roles: ['admin', 'bienestar', 'estudiante'] },
  { name: 'bienestar', title: 'bienestar', icon: 'medkit-outline', iconFocused: 'medkit', roles: ['admin', 'bienestar'] },
  { name: 'horario', title: 'Horario', icon: 'calendar-outline', iconFocused: 'calendar', roles: ['admin', 'bienestar', 'estudiante'] },
  { name: 'mi-cuenta', title: 'Mi cuenta', icon: 'person-outline', iconFocused: 'person', roles: ['admin', 'bienestar', 'estudiante'] },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        router.replace('/');
      }
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        getToken().then(token => {
          if (!token) router.replace('/');
        });
      }
    };

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const user = await getUser();
        if (user?.role) setUserRole(user.role);
      })();
    }, [])
  );

  const screens = ALL_SCREENS;

  // Always use bottom Tabs for navigation (sidebar removed per design).
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 58,
        },
      }}>
      {screens.map((s) => (
        <Tabs.Screen
          key={s.name}
          name={s.name}
          options={{
            title: s.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={(focused ? s.iconFocused : s.icon) as any}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="account/info" options={{ href: null }} />
      <Tabs.Screen name="account/preferences" options={{ href: null }} />
      <Tabs.Screen name="account/academic" options={{ href: null }} />
      <Tabs.Screen name="account/average-calc" options={{ href: null }} />
      <Tabs.Screen name="account/final-calc" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh',
  },
  sidebar: {
    width: 96,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sideItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  sideText: {
    fontSize: 12,
    color: '#111',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
