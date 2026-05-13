import React from 'react';
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

export default function AcademicScreen() {
  const stats = [
    { label: 'Promedio actual', value: '3.85', icon: 'school-outline', color: '#4CAF50' },
    { label: 'Créditos aprobados', value: '98', icon: 'checkmark-done-circle-outline', color: '#2196F3' },
    { label: 'Créditos totales', value: '160', icon: 'list-outline', color: '#9C27B0' },
    { label: 'Promedio ponderado', value: '3.85', icon: 'calculator-outline', color: accountPalette.primary },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={accountPalette.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Académico</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Herramientas Row */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={[styles.toolCard, { backgroundColor: accountPalette.primary }]}
            onPress={() => router.push('/account/average-calc')}
          >
            <Text style={styles.toolTitle}>Calculadora de promedio</Text>
            <Text style={styles.toolSubtitle}>Calcula tu promedio ponderado con créditos</Text>
            <View style={styles.toolIconBox}>
              <Ionicons name="stats-chart" size={24} color={accountPalette.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#F1F3F5' }]}
            onPress={() => router.push('/account/final-calc')}
          >
            <Text style={[styles.toolTitle, { color: accountPalette.text }]}>¿Cuánto necesito en el final?</Text>
            <Text style={[styles.toolSubtitle, { color: accountPalette.textMuted }]}>Descubre qué nota necesitas para aprobar</Text>
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(255, 122, 0, 0.1)' }]}>
              <Ionicons name="locate" size={28} color={accountPalette.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumen rápido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen rápido</Text>
          <View style={styles.statsList}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statLeft}>
                  <View style={styles.statIconBox}>
                    <Ionicons name={stat.icon as any} size={20} color={accountPalette.text} />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                <Text style={[styles.statValue, { color: stat.color === accountPalette.primary ? accountPalette.primary : (stat.label.includes('Promedio') ? '#4CAF50' : accountPalette.text) }]}>
                  {stat.value}
                </Text>
              </View>
            ))}
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
  toolsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 35,
  },
  toolCard: {
    flex: 1,
    padding: 20,
    borderRadius: 25,
    height: 220,
    justifyContent: 'space-between',
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 22,
  },
  toolSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  toolIconBox: {
    width: 54,
    height: 54,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: accountPalette.text,
    marginBottom: 20,
  },
  statsList: {
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: accountPalette.text,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
