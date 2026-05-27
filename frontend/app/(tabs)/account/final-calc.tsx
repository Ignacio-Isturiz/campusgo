import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountPalette } from '@/src/components/account/AccountStyles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix: string;
  theme: typeof Colors.light;
};

function InputField({ label, value, onChangeText, suffix, theme }: InputFieldProps) {
  return (
    <View style={styles.inputItem}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          style={[styles.textInput, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0.0"
          placeholderTextColor={theme.textMuted}
          blurOnSubmit={false}
        />
        <Text style={[styles.suffix, { color: theme.textMuted }]}>{suffix}</Text>
      </View>
    </View>
  );
}

export default function FinalCalcScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const ui = Colors[colorScheme] || Colors.light;
  const [currentGrade, setCurrentGrade] = useState('3.2');
  const [remainingWeight, setRemainingWeight] = useState('40');
  const [targetGrade, setTargetGrade] = useState('3.5');
  const [neededGrade, setNeededGrade] = useState(0);

  useEffect(() => {
    const cur = parseFloat(currentGrade) || 0;
    const weight = parseFloat(remainingWeight) || 0;
    const target = parseFloat(targetGrade) || 0;

    if (weight > 0) {
      const currentWeight = 100 - weight;
      const currentPoints = cur * (currentWeight / 100);
      const needed = (target - currentPoints) / (weight / 100);
      setNeededGrade(needed > 0 ? needed : 0);
    }
  }, [currentGrade, remainingWeight, targetGrade]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ui.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/mi-cuenta')}>
          <Ionicons name="chevron-back" size={24} color={ui.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: ui.text }]}>¿Cuánto necesito en el final?</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={ui.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inputsCard, { backgroundColor: ui.surfaceAlt, borderColor: ui.border }]}> 
          <InputField
            label="Nota actual del curso"
            value={currentGrade}
            onChangeText={setCurrentGrade}
            suffix="/ 5.0"
            theme={ui}
          />
          <View style={[styles.divider, { backgroundColor: ui.border }]} />
          <InputField
            label="Peso de lo que falta (porcentaje)"
            value={remainingWeight}
            onChangeText={setRemainingWeight}
            suffix="%"
            theme={ui}
          />
          <View style={[styles.divider, { backgroundColor: ui.border }]} />
          <InputField
            label="Nota objetivo"
            value={targetGrade}
            onChangeText={setTargetGrade}
            suffix="/ 5.0"
            theme={ui}
          />
        </View>

        <View style={[styles.resultCard, { backgroundColor: ui.surfaceAlt, borderColor: ui.border }]}> 
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, { color: ui.text }]}>Necesitas en el final</Text>
            <Ionicons name="arrow-redo-outline" size={18} color={ui.tint} />
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.resultValue, { color: ui.text }]}>{neededGrade.toFixed(2)}</Text>
            <Text style={[styles.valueSuffix, { color: ui.textMuted }]}>/ 5.0</Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: ui.surface, borderColor: ui.border }]}> 
          <Ionicons name="information-circle" size={20} color={ui.textMuted} />
          <Text style={[styles.infoText, { color: ui.text }]}> 
            Necesitas sacar <Text style={{ fontWeight: '700' }}>{neededGrade.toFixed(2)}</Text> o más en el final para alcanzar tu nota objetivo.
          </Text>
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
  inputsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  inputItem: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: accountPalette.text,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    minWidth: 110,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '700',
    color: accountPalette.text,
    textAlign: 'right',
    flex: 1,
    marginRight: 5,
  },
  suffix: {
    fontSize: 13,
    color: accountPalette.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
  },
  resultCard: {
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  resultValue: {
    fontSize: 56,
    fontWeight: '800',
  },
  valueSuffix: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
