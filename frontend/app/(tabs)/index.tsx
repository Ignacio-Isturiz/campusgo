import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ParallaxScrollView from '@/components/parallax-scroll-view';

const API_URL = 'http://localhost:3000/status'; // Ajustar según sea necesario

export default function HomeScreen() {
  const [status, setStatus] = useState({
    mongodb: 'Cargando...',
    backend: 'Cargando...',
    frontend: 'Corriendo'
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStatus({
        ...data,
        frontend: 'Corriendo'
      });
    } catch (error) {
      setStatus({
        mongodb: 'Error',
        backend: 'Desconectado',
        frontend: 'Corriendo'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const StatusItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <ThemedView style={styles.statusItem}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <ThemedView style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <ThemedText>{value}</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const getStatusColor = (value: string) => {
    if (value === 'Conectado' || value === 'Corriendo') return '#4CAF50';
    if (value === 'Cargando...') return '#FFC107';
    return '#F44336';
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Estado del Sistema</ThemedText>
      </ThemedView>

      <ThemedView style={styles.container}>
        <StatusItem 
          label="Frontend" 
          value={status.frontend} 
          color={getStatusColor(status.frontend)} 
        />
        <StatusItem 
          label="Backend" 
          value={status.backend} 
          color={getStatusColor(status.backend)} 
        />
        <StatusItem 
          label="MongoDB" 
          value={status.mongodb} 
          color={getStatusColor(status.mongodb)} 
        />
      </ThemedView>

      {loading && <ActivityIndicator size="large" color="#A1CEDC" style={{ marginTop: 20 }} />}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  container: {
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
