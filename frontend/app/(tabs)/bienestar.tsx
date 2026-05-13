import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { saveLastRoute } from '@/src/utils/storage';

export default function BienestarScreen() {
  useEffect(() => {
    saveLastRoute('/(tabs)/bienestar');
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>bienestar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, color: '#111' },
});
