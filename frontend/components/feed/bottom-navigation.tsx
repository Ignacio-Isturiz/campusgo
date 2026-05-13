import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  background: '#0a0a0a',
  surface: '#121212',
  primary: '#FFFFFF',
  secondary: 'rgba(255, 255, 255, 0.7)',
  muted: 'rgba(255, 255, 255, 0.4)',
  accent: '#FF1493',
  secondary_accent: '#00D9FF',
};

type NavTab = 'home' | 'search' | 'add' | 'notifications' | 'profile';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: 'home' | 'search' | 'add-circle' | 'notifications' | 'person';
  iconOutline: 'home-outline' | 'search-outline' | 'add-circle-outline' | 'notifications-outline' | 'person-outline';
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    iconOutline: 'home-outline',
  },
  {
    id: 'search',
    label: 'Search',
    icon: 'search',
    iconOutline: 'search-outline',
  },
  {
    id: 'add',
    label: 'Create',
    icon: 'add-circle',
    iconOutline: 'add-circle-outline',
  },
  {
    id: 'notifications',
    label: 'Likes',
    icon: 'notifications',
    iconOutline: 'notifications-outline',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person',
    iconOutline: 'person-outline',
  },
];

/**
 * BottomNavigation - Barra de navegación inferior moderna
 * Inspirada en Instagram con animaciones suaves
 * Contiene: Home, Search, Add, Notifications, Profile
 */
export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!isMobile) {
    return null; // Ocultar en desktop por ahora
  }

  return (
    <View style={[styles.navContainer, { paddingBottom: insets.bottom }]}>
      {/* Fondo con glassmorphism */}
      <View style={styles.navBackground} />

      <View style={styles.navContent}>
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onPress={() => onTabChange(item.id)}
          />
        ))}
      </View>

      {/* Divisor superior sutil */}
      <View style={styles.topDivider} />
    </View>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}

/**
 * NavButton - Botón individual de navegación con animación
 */
function NavButton({ item, isActive, onPress }: NavButtonProps) {
  const [scaleAnim] = React.useState(new Animated.Value(isActive ? 1.1 : 1));

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.1 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isActive, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.navButton,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.buttonTouchable}
        activeOpacity={0.7}
      >
        <View style={[styles.buttonContent, isActive && styles.buttonContentActive]}>
          {item.id === 'add' ? (
            <Ionicons
              name={isActive ? item.icon : item.iconOutline}
              size={isActive ? 28 : 26}
              color={isActive ? colors.accent : colors.secondary}
            />
          ) : (
            <Ionicons
              name={isActive ? item.icon : item.iconOutline}
              size={isActive ? 26 : 24}
              color={isActive ? colors.primary : colors.secondary}
            />
          )}

          {/* Indicador de activo */}
          {isActive && <View style={styles.activeIndicator} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'relative',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1000,
  },
  navBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.6)',
    backdropFilter: 'blur(20px)',
  },
  topDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Contenido
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    paddingVertical: 8,
  },

  // Botón
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    padding: 8,
  },
  buttonContentActive: {
    // Efecto sutil en el botón activo
  },

  // Indicador de activo
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
});
