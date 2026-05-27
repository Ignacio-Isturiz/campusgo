import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { getLastRoute, getToken } from '@/src/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        router.replace('/');
        return;
      }
    })();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(async () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        const last = await getLastRoute();
        const token = await getToken();
        if (!token) {
          router.replace('/');
          return;
        }
        if (last && last !== '/(tabs)' && last !== '/(tabs)/index') {
          router.replace(last);
        } else {
          router.replace('/(tabs)/mi-cuenta');
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, spinAnim, fadeAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={require('@/assets/images/UNAULA-SIN-FONDO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});
