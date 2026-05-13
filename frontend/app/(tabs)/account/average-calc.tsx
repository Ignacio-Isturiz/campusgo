import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountPalette } from '@/src/components/account/AccountStyles';

export default function AverageCalcScreen() {
  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Estructuras de Datos', grade: '4.2', credits: '4' },
    { id: '2', name: 'Bases de Datos', grade: '3.8', credits: '3' },
    { id: '3', name: 'Redes de Computadores', grade: '4.5', credits: '3' },
    { id: '4', name: 'Ingeniería de Software', grade: '4.0', credits: '4' },
    { id: '5', name: 'Matemáticas Discretas', grade: '3.7', credits: '3' },
  ]);

  const [weightedAvg, setWeightedAvg] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    let sum = 0;
    let credits = 0;
    subjects.forEach(s => {
      const g = parseFloat(s.grade) || 0;
      const c = parseInt(s.credits) || 0;
      sum += g * c;
      credits += c;
    });
    setWeightedAvg(credits > 0 ? sum / credits : 0);
    setTotalCredits(credits);
  }, [subjects]);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { id: Date.now().toString(), name: '', grade: '', credits: '' },
    ]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: string, value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={accountPalette.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculadora de promedio</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={accountPalette.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, { flex: 2.5 }]}>Asignatura</Text>
          <Text style={[styles.columnLabel, { flex: 1, textAlign: 'center' }]}>Nota</Text>
          <Text style={[styles.columnLabel, { flex: 1, textAlign: 'center' }]}>Créditos</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.subjectsList}>
          {subjects.map((item) => (
            <View key={item.id} style={styles.subjectRow}>
              <TextInput
                style={[styles.subjectInput, { flex: 2.5 }]}
                value={item.name}
                onChangeText={(text) => updateSubject(item.id, 'name', text)}
                placeholder="Nombre"
                placeholderTextColor="#BBB"
              />
              <TextInput
                style={[styles.gradeInput, { flex: 1 }]}
                value={item.grade}
                onChangeText={(text) => updateSubject(item.id, 'grade', text)}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor="#BBB"
              />
              <TextInput
                style={[styles.creditInput, { flex: 1 }]}
                value={item.credits}
                onChangeText={(text) => updateSubject(item.id, 'credits', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#BBB"
              />
              <TouchableOpacity onPress={() => removeSubject(item.id)} style={styles.removeBtn}>
                <Ionicons name="close" size={20} color="#BBB" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addSubject}>
          <Ionicons name="add" size={20} color={accountPalette.primary} />
          <Text style={styles.addBtnText}>Agregar asignatura</Text>
        </TouchableOpacity>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Promedio ponderado</Text>
            <Ionicons name="refresh-circle-outline" size={20} color={accountPalette.primary} />
          </View>
          <Text style={styles.resultValue}>{weightedAvg.toFixed(2)}</Text>
          <Text style={styles.resultSubtext}>Créditos totales: {totalCredits}</Text>
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: accountPalette.textMuted,
  },
  subjectsList: {
    gap: 12,
    marginBottom: 20,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectInput: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: accountPalette.text,
    fontWeight: '500',
  },
  gradeInput: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 14,
    color: accountPalette.text,
    fontWeight: '700',
  },
  creditInput: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 14,
    color: accountPalette.text,
    fontWeight: '700',
  },
  removeBtn: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F3F5',
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addBtnText: {
    color: accountPalette.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: accountPalette.text,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '800',
    color: accountPalette.primary,
  },
  resultSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: accountPalette.textMuted,
    marginTop: 5,
  },
});
