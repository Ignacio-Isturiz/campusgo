import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { saveLastRoute } from '@/src/utils/storage';

export default function FeedScreen() {
  useEffect(() => {
    saveLastRoute('/(tabs)/feed');
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>feed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, color: '#111' },
});
