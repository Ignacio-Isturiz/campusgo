import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getUser, signOut, getPhoto, clearAll } from '@/src/utils/storage';
import { on as onEvent } from '@/src/utils/events';
import { accountPalette } from '@/src/components/account/AccountStyles';

/**
 * Extrae el nombre y apellido del formato nombre.apellido####@unaula.edu.co
 */
function parseNameFromEmail(email: string): string {
  try {
    const localPart = email.split('@')[0];
    const namePart = localPart.replace(/[0-9]/g, ''); 
    const parts = namePart.split('.');
    
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${firstName} ${lastName}`;
    }
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  } catch (e) {
    return '';
  }
}

export default function MiCuentaScreen() {
  const [user, setUser] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);
    // Load photo from user data first, then fallback to saved photo
    if (userData?.photoUrl) {
      setPhoto(userData.photoUrl);
    } else {
      const savedPhoto = await getPhoto();
      if (savedPhoto && !savedPhoto.startsWith('blob:')) {
        setPhoto(savedPhoto);
      } else {
        setPhoto(null);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    const unsub = onEvent('photo:changed', (photoUrl: string) => {
      setPhoto(photoUrl);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('signOut failed', e);
    }

    // Ensure local session cleared and UI state reset
    try {
      await clearAll();
    } catch (e) {
      // ignore
    }

    setUser(null);
    setPhoto(null);

    if (Platform.OS === 'web') {
      window.location.replace('/');
      return;
    }
    // For native platforms, navigate to loading which checks auth
    // and redirects to login if no token (avoids tabs/index ambiguity)
    router.replace('/loading');
  };

  const menuItems = [
    {
      id: 'info',
      title: 'Mi información',
      subtitle: 'Edita tu perfil y datos personales',
      icon: 'person-outline',
      route: '/account/info',
    },
    {
      id: 'preferences',
      title: 'Preferencias',
      subtitle: 'Tema, idioma y más',
      icon: 'settings-outline',
      route: '/account/preferences',
    },
    {
      id: 'academic',
      title: 'Académico',
      subtitle: 'Promedio, créditos y cálculo final',
      icon: 'school-outline',
      route: '/account/academic',
    },
    {
      id: 'security',
      title: 'Seguridad',
      subtitle: 'Contraseña y sesión',
      icon: 'shield-checkmark-outline',
      route: '/account/security',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800&q=80' }}
            style={styles.headerBg}
            blurRadius={2}
          />
          <View style={styles.headerOverlay} />
          
          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <Image 
                source={require('@/assets/images/ESCUDO-UNAULA.png')} 
                style={styles.logoImage} 
              />
              <Text style={styles.brandText}>UNAULA</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="settings-sharp" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={photo ? { uri: photo } : require('@/assets/images/sinfoto.png')}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.userName}>
              {user?.email ? parseNameFromEmail(user.email) : 'Estudiante UNAULA'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'correo@unaula.edu.co'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Estudiante'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon as any} size={22} color={accountPalette.text} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={accountPalette.textMuted} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={accountPalette.primary} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    height: 320,
    backgroundColor: accountPalette.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 122, 0, 0.7)', // Overlay institucional
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: accountPalette.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  brandText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  settingsBtn: {
    padding: 5,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: accountPalette.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: accountPalette.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE0CC',
    borderRadius: 20,
    backgroundColor: '#FFF8F2',
  },
  logoutText: {
    color: accountPalette.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
