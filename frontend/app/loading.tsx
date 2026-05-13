import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Colores modernos inspirados en Instagram/TikTok
const colors = {
  background: '#0f0f0f',
  primary: '#FFFFFF',
  accent: '#FF1493',
  secondary: '#00D9FF',
};

/**
 * LoadingScreen - Pantalla de transición elegante y minimalista
 * Aparece después del login durante 2 segundos
 * Inspirada en diseño moderno premium
 */
export default function LoadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Animación de entrada elegante
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Después de 2 segundos, transiciona al feed
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Fondo gradiente sutil */}
      <View style={styles.backgroundGradient} />

      {/* Elementos decorativos animados */}
      <Animated.View
        style={[
          styles.floatingElementTop,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.15],
            }),
          },
        ]}
      >
        <View style={styles.orb} />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElementBottom,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.1],
            }),
          },
        ]}
      >
        <View style={[styles.orb, { width: 120, height: 120 }]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Nombre de la app */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <View style={styles.logoInner} />
          </View>
          <Animated.Text style={styles.appName}>CampusGO</Animated.Text>
        </View>

        {/* Loader moderno */}
        <View style={styles.loaderContainer}>
          <LoaderDots />
        </View>

        {/* Texto descriptivo */}
        <View style={styles.textContainer}>
          <Animated.Text style={styles.subtitle}>Preparando tu experiencia...</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Componente de loader con puntos animados
 * Muestra 3 puntos que aparecen/desaparecen secuencialmente
 */
function LoaderDots() {
  const [animations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    const startAnimations = () => {
      animations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              delay: index * 200,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    };

    startAnimations();
  }, [animations]);

  return (
    <View style={styles.dotsRow}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.animatedDot,
            {
              opacity: anim,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBox: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.accent,
    opacity: 0.85,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // Loader
  loaderContainer: {
    marginBottom: 80,
    height: 50,
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  animatedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },

  // Texto
  textContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // Elementos decorativos flotantes
  floatingElementTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    zIndex: 1,
  },
  floatingElementBottom: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    zIndex: 1,
  },
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
});
