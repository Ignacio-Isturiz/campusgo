import React from 'react';
import { Platform, View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Tabs, Slot, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SCREENS = [
  { name: 'feed', title: 'feed', icon: 'newspaper-outline', iconFocused: 'newspaper' },
  { name: 'marketplace', title: 'marketplace', icon: 'storefront-outline', iconFocused: 'storefront' },
  { name: 'bienestar', title: 'bienestar', icon: 'medkit-outline', iconFocused: 'medkit' },
  { name: 'horario', title: 'Horario', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'mi-cuenta', title: 'Mi cuenta', icon: 'person-outline', iconFocused: 'person' },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width >= 900;

  if (isDesktopWeb) {
    return (
      <View style={[styles.webRoot, { backgroundColor: '#ffffff' }]}>
        <View style={styles.sidebar}>
          {SCREENS.slice().reverse().map((s) => (
            <Link
              key={s.name}
              href={`/(tabs)/${s.name}`}
              asChild
            >
              <Pressable style={styles.sideItem}>
                <Ionicons name={s.icon as any} size={16} color="#111" />
                <Text style={styles.sideText}>{s.title}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    );
  }

  // Mobile / native: use Tabs with bottom bar. We set row-reverse to match right-to-left visual order.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          flexDirection: 'row-reverse',
          borderTopColor: '#ececec',
          borderTopWidth: 1,
          height: 58,
        },
      }}>
      {SCREENS.map((s) => (
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
      <Tabs.Screen name="account/security" options={{ href: null }} />
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
