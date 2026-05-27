import React from 'react';
import { Platform, View, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { signOut } from '@/src/utils/storage';

const colorDefaults = {
  background: '#fff',
  primary: '#111',
  secondary: '#687076',
  muted: 'rgba(0,0,0,0.4)',
  accent: '#FF1493',
};

/**
 * FeedHeader - Header superior del feed
 * Logo/Nombre de la app + iconos de notificaciones
 * Diseño minimalista moderno con glassmorphism suave
 */
export default function FeedHeader() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] ?? colorDefaults;
  const colors = {
    background: theme.background,
    primary: theme.text,
    secondary: theme.icon,
    muted: theme.muted,
    accent: theme.tint,
  };
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleLogout = async () => {
    await signOut();
    if (Platform.OS === 'web') {
      window.location.href = '/';
      return;
    }
    router.replace('/');
  };

  return (
    <View style={[styles.headerMinimal, { paddingTop: insets.top, backgroundColor: colors.background }]}>      
      <View style={styles.actionIconsMinimal}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },

  // Brand
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 20, 147, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 20, 147, 0.3)',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Acciones
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },

  // Divisor
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 0,
  },
  headerMinimal: {
    zIndex: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionIconsMinimal: {
    alignItems: 'flex-end',
  },
});
