import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountPalette } from '@/src/components/account/AccountStyles';

export default function PreferencesScreen() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState('Español');
  const [instColor, setInstColor] = useState('#FF7A00');

  const institutionalColors = ['#FF7A00', '#F24822', '#F8C548', '#1A1A1A'];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={accountPalette.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferencias</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[styles.themeBox, theme === 'light' && styles.themeBoxActive]}
              onPress={() => setTheme('light')}
            >
              <Ionicons name="sunny-outline" size={24} color={theme === 'light' ? accountPalette.text : accountPalette.textMuted} />
              <Text style={[styles.themeLabel, theme === 'light' && styles.themeLabelActive]}>Claro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeBox, theme === 'dark' && styles.themeBoxActive]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons name="moon-outline" size={24} color={theme === 'dark' ? accountPalette.text : accountPalette.textMuted} />
              <Text style={[styles.themeLabel, theme === 'dark' && styles.themeLabelActive]}>Oscuro</Text>
              {theme === 'dark' && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={accountPalette.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idioma</Text>
          <TouchableOpacity style={styles.languageBtn}>
            <View style={styles.languageLeft}>
              <Ionicons name="globe-outline" size={22} color={accountPalette.text} />
              <Text style={styles.languageText}>{language}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={accountPalette.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Color Institucional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color institucional</Text>
          <Text style={styles.sectionSubtitle}>Personaliza la app con los colores de UNAULA</Text>
          <View style={styles.colorRow}>
            {institutionalColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  instColor === color && styles.colorCircleActive,
                ]}
                onPress={() => setInstColor(color)}
              >
                {instColor === color && (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card UNAULA */}
        <View style={[styles.unaulaCard, { backgroundColor: instColor }]}>
          <View style={styles.unaulaLogoBox}>
            <Image 
              source={require('@/assets/images/unaulalogo.png')} 
              style={styles.unaulaLogoImage} 
            />
          </View>
          <View>
            <Text style={styles.unaulaCardTitle}>UNAULA</Text>
            <Text style={styles.unaulaCardSubtitle}>Identidad, Educación y Futuro</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: accountPalette.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: accountPalette.text,
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: accountPalette.textMuted,
    marginBottom: 15,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 15,
  },
  themeBox: {
    flex: 1,
    height: 90,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
    position: 'relative',
  },
  themeBoxActive: {
    backgroundColor: '#FFF',
    borderColor: accountPalette.primary,
    shadowColor: accountPalette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: accountPalette.textMuted,
    marginTop: 8,
  },
  themeLabelActive: {
    color: accountPalette.text,
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  languageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageText: {
    fontSize: 15,
    fontWeight: '600',
    color: accountPalette.text,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 15,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  unaulaCard: {
    marginTop: 10,
    padding: 25,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  unaulaLogoBox: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  unaulaLogoImage: {
    width: 32,
    height: 32,
  },
  unaulaCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  unaulaCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
