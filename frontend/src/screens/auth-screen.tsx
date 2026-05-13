import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  requestForgotOtp,
  requestLoginOtp,
  requestRegisterOtp,
  verifyForgotOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} from '@/src/services/auth';
import { saveToken, saveUser } from '@/src/utils/storage';

type Mode = 'login' | 'register' | 'forgot';
type Stage = 'form' | 'otp' | 'reset';

const ALLOWED_DOMAIN = '@unaula.edu.co';

const palette = {
  background: '#FFF8F0',
  surface: '#FFFFFF',
  ink: '#17110E',
  muted: '#7C6A5D',
  line: '#E8D8C8',
  primary: '#4C90FF',
  primarySoft: '#DCE9FF',
  warm: '#FF9D1F',
  warmDeep: '#F2482E',
  warmAlt: '#F8C548',
  accent: '#E91E63',
};

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
  otp: '',
  newPassword: '',
};

function isInstitutionEmail(email: string) {
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}

function fieldLabel(mode: Mode, stage: Stage) {
  return 'Correo institucional';
}

function actionLabel(mode: Mode, stage: Stage) {
  if (stage === 'otp') {
    return 'Verificar código';
  }

  if (stage === 'reset') {
    return 'Actualizar contraseña';
  }

  if (mode === 'register') {
    return 'Enviar código de registro';
  }

  if (mode === 'forgot') {
    return 'Enviar código de recuperación';
  }

  return 'Enviar código de acceso';
}

function ModePill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modePill, active && styles.modePillActive]}>
      <Text style={[styles.modePillText, active && styles.modePillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9F8F83"
        style={styles.fieldInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function HeroArtwork() {
  return (
    <View style={styles.heroArtworkWrap}>
      <View style={styles.heroAuraOne} />
      <View style={styles.heroAuraTwo} />
      <View style={styles.emblemOuter}>
        <View style={styles.emblemInner}>
          <View style={styles.emblemTopBand} />
          <View style={styles.emblemIconRow}>
            <View style={styles.emblemBar} />
            <View style={styles.emblemCenterBar} />
            <View style={styles.emblemBar} />
          </View>
          <View style={styles.emblemBase} />
          <Text style={styles.emblemText}>AL</Text>
        </View>
      </View>
      <View style={styles.cardCluster}>
        <View style={[styles.cardShape, styles.cardBackLeft]} />
        <View style={[styles.cardShape, styles.cardBackRight]} />
        <View style={[styles.cardShape, styles.cardFront]}>
          <View style={styles.cardBadgeRow}>
            <View style={styles.badgePink} />
            <View style={styles.badgeYellow} />
            <View style={styles.badgeBlue} />
          </View>
          <View style={styles.cardProfile}>
            <View style={styles.profileCircle} />
            <View style={styles.profileLine} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AuthScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [mode, setMode] = useState<Mode>('login');
  const [stage, setStage] = useState<Stage>('form');
  const [form, setForm] = useState(initialForm);
  const [challengeId, setChallengeId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const subtitle = useMemo(() => {
    if (mode === 'register') {
      return 'Crea tu cuenta con correo institucional y verifica el acceso por OTP.';
    }

    if (mode === 'forgot') {
      return 'Recupera tu acceso con un código enviado al correo UNAULA.';
    }

    return 'Ingresa con tu correo institucional y un código de verificación de un solo uso.';
  }, [mode]);

  const resetForm = () => {
    setForm(initialForm);
    setChallengeId('');
    setResetToken('');
    setStage('form');
    setMessage('');
  };

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setSuccess('');
    setMessage('');
    resetForm();
  };

  const handlePrimaryAction = async () => {
    const email = form.email.trim().toLowerCase();

    if (!isInstitutionEmail(email)) {
      setMessage(`El correo debe terminar en ${ALLOWED_DOMAIN}`);
      return;
    }

    if (mode === 'register' && !form.password.trim()) {
      setMessage('La contraseña es obligatoria.');
      return;
    }

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setMessage('');
    setSuccess('');

    try {
      if (mode === 'login') {
        if (stage === 'form') {
          const response = await requestLoginOtp(email, form.password);
          setChallengeId(response.challengeId || '');
          setStage('otp');
          setMessage(response.message || 'Código OTP enviado al correo institucional.');
          return;
        }

        const response = await verifyLoginOtp(challengeId, form.otp.trim(), email);
        if (response.token) {
          await saveToken(response.token);
        }
        if (response.user) {
          await saveUser(response.user);
        }
        setSuccess(response.message || 'Acceso concedido.');
        router.replace('/loading');
        return;
      }

      if (mode === 'register') {
        if (stage === 'form') {
          const response = await requestRegisterOtp(email, form.password);
          setChallengeId(response.challengeId || '');
          setStage('otp');
          setMessage(response.message || 'Código OTP enviado para completar el registro.');
          return;
        }

        const response = await verifyRegisterOtp(challengeId, form.otp.trim(), email);
        if (response.token) {
          await saveToken(response.token);
        }
        if (response.user) {
          await saveUser(response.user);
        }
        setSuccess(response.message || 'Registro completado.');
        router.replace('/loading');
        return;
      }

      if (stage === 'form') {
        const response = await requestForgotOtp(email);
        setChallengeId(response.challengeId || '');
        setStage('otp');
        setMessage(response.message || 'Código OTP enviado para recuperar la contraseña.');
        return;
      }

      if (stage === 'otp') {
        const response = await verifyForgotOtp(challengeId, form.otp.trim());
        setResetToken(response.resetToken || '');
        setStage('reset');
        setMessage(response.message || 'Ingresa tu nueva contraseña.');
        return;
      }

      const response = await verifyForgotOtp(challengeId, form.otp.trim(), form.newPassword, resetToken);
      setSuccess(response.message || 'Contraseña actualizada.');
      handleModeChange('login');
    } catch (error) {
      const fallback = 'No fue posible completar la solicitud.';
      setMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.page, isDesktop ? styles.pageDesktop : styles.pageMobile]}>
        <View style={[styles.shell, isDesktop ? styles.shellDesktop : styles.shellMobile]}>
          <View style={[styles.hero, isDesktop ? styles.heroDesktop : styles.heroMobile]}>
            <View style={styles.heroCopy}>
              <Text style={styles.brandLabel}>UNAULA Connect</Text>
              <Text style={styles.heroTitle}>
                Accede a tu comunidad con un{' '}
                <Text style={{ color: palette.warmDeep }}>login seguro</Text> y{' '}
                <Text style={{ color: palette.accent }}>OTP institucional</Text>.
              </Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
            </View>
            <HeroArtwork />
          </View>

          <View style={[styles.card, isDesktop ? styles.cardDesktop : styles.cardMobile]}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.cardTitle}>
                  {mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Recuperar contraseña'}
                </Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
              </View>
              <View style={styles.brandMini}>
                <View style={styles.brandMiniDot} />
                <Text style={styles.brandMiniText}>UNAULA</Text>
              </View>
            </View>

            <View style={styles.modeRow}>
              <ModePill active={mode === 'login'} label="Login" onPress={() => handleModeChange('login')} />
              <ModePill active={mode === 'register'} label="Registro" onPress={() => handleModeChange('register')} />
              <ModePill active={mode === 'forgot'} label="Olvidé mi clave" onPress={() => handleModeChange('forgot')} />
            </View>

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={22} color={palette.warmDeep} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <Field
              label={fieldLabel(mode, stage)}
              value={form.email}
              onChangeText={(text) => setForm((current) => ({ ...current, email: text }))}
              placeholder={`correo@unaula.edu.co`}
              keyboardType="email-address"
            />

            {mode === 'register' && stage === 'form' ? (
              <Field
                label="Contraseña"
                value={form.password}
                onChangeText={(text) => setForm((current) => ({ ...current, password: text }))}
                placeholder="Ingresa tu contraseña"
                secureTextEntry
              />
            ) : null}

            {mode === 'register' && stage === 'form' ? (
              <Field
                label="Confirmar contraseña"
                value={form.confirmPassword}
                onChangeText={(text) => setForm((current) => ({ ...current, confirmPassword: text }))}
                placeholder="Repite tu contraseña"
                secureTextEntry
              />
            ) : null}

            {stage !== 'form' ? (
              <Field
                label="Código OTP"
                value={form.otp}
                onChangeText={(text) => setForm((current) => ({ ...current, otp: text }))}
                placeholder="000000"
                keyboardType="number-pad"
              />
            ) : null}

            {mode === 'forgot' && stage === 'reset' ? (
              <Field
                label="Nueva contraseña"
                value={form.newPassword}
                onChangeText={(text) => setForm((current) => ({ ...current, newPassword: text }))}
                placeholder="Escribe una nueva contraseña"
                secureTextEntry
              />
            ) : null}

            {message ? (
              <View style={styles.messageBox}>
                <Ionicons name="information-circle-outline" size={18} color={palette.warmDeep} />
                <Text style={styles.messageText}>{message}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handlePrimaryAction}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && canSubmit ? styles.primaryButtonPressed : null,
                !canSubmit ? styles.primaryButtonDisabled : null,
              ]}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{actionLabel(mode, stage)}</Text>
              )}
            </Pressable>

            <View style={styles.secondaryRow}>
              <Pressable onPress={() => handleModeChange('forgot')}>
                <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
              <Text style={styles.helperText}>Solo correos con dominio {ALLOWED_DOMAIN}</Text>
            </View>

            <View style={styles.footerNote}>
              <Ionicons name="shield-checkmark" size={16} color={palette.warmDeep} />
              <Text style={styles.footerNoteText}>
                Roles disponibles: Admin, Bienestar y Estudiante. El registro crea automáticamente un Estudiante.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  page: {
    flexGrow: 1,
    backgroundColor: palette.background,
  },
  pageDesktop: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  pageMobile: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shell: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1480,
    gap: 24,
  },
  shellDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  shellMobile: {
    flexDirection: 'column',
  },
  hero: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: 'hidden',
  },
  heroDesktop: {
    flex: 1.18,
    borderRadius: 36,
    minHeight: 760,
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    paddingVertical: 32,
  },
  heroMobile: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    gap: 24,
  },
  heroCopy: {
    gap: 12,
  },
  brandLabel: {
    color: palette.warmDeep,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '700',
    letterSpacing: -1.3,
    maxWidth: 700,
    fontFamily: Platform.select({ web: 'ui-rounded, system-ui, sans-serif', default: 'System' }),
  },
  heroSubtitle: {
    color: palette.muted,
    fontSize: 18,
    lineHeight: 27,
    maxWidth: 620,
  },
  heroArtworkWrap: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 460,
    height: 460,
  },
  heroAuraOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(248, 197, 72, 0.24)',
    top: 40,
    right: 48,
  },
  heroAuraTwo: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(241, 72, 46, 0.12)',
    left: 36,
    bottom: 52,
  },
  emblemOuter: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 10,
    borderColor: palette.warmDeep,
    backgroundColor: palette.warm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  emblemInner: {
    width: 226,
    height: 226,
    borderRadius: 113,
    borderWidth: 5,
    borderColor: palette.warmAlt,
    backgroundColor: '#FFB02D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemTopBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 98,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    backgroundColor: '#FFB12B',
  },
  emblemIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
    marginTop: 8,
  },
  emblemBar: {
    width: 22,
    height: 86,
    borderRadius: 8,
    backgroundColor: palette.warmDeep,
  },
  emblemCenterBar: {
    width: 22,
    height: 118,
    borderRadius: 8,
    backgroundColor: palette.warmDeep,
  },
  emblemBase: {
    width: 92,
    height: 20,
    marginTop: -6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: palette.warmDeep,
  },
  emblemText: {
    marginTop: 18,
    color: palette.warmDeep,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 8,
  },
  cardCluster: {
    position: 'absolute',
    bottom: 6,
    width: 320,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardShape: {
    position: 'absolute',
    width: 138,
    height: 192,
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardBackLeft: {
    left: 12,
    top: 18,
    backgroundColor: '#FF8A5C',
    transform: [{ rotate: '-8deg' }],
  },
  cardBackRight: {
    right: 14,
    top: 12,
    backgroundColor: '#80D0F5',
    transform: [{ rotate: '9deg' }],
  },
  cardFront: {
    backgroundColor: '#FFD08A',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    transform: [{ rotate: '-1deg' }],
  },
  cardBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-start',
  },
  badgePink: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.accent,
  },
  badgeYellow: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.warmAlt,
  },
  badgeBlue: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.primary,
  },
  cardProfile: {
    width: '100%',
    height: 130,
    borderRadius: 22,
    backgroundColor: '#FFF4E4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  profileCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7D39A',
    marginBottom: 10,
  },
  profileLine: {
    width: 82,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1B356',
  },
  card: {
    flex: 0.82,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cardDesktop: {
    borderRadius: 36,
    minHeight: 760,
    paddingHorizontal: 34,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  cardMobile: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
  },
  brandMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.line,
  },
  brandMiniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.warmDeep,
  },
  brandMiniText: {
    color: palette.ink,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  modePill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.line,
  },
  modePillActive: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.primary,
  },
  modePillText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  modePillTextActive: {
    color: palette.primary,
  },
  fieldBlock: {
    gap: 8,
    marginBottom: 14,
  },
  fieldLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  fieldInput: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#FFFDFC',
    paddingHorizontal: 16,
    color: palette.ink,
    fontSize: 16,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFF1E8',
    marginBottom: 14,
  },
  messageText: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFF6D9',
    marginBottom: 14,
  },
  successText: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryRow: {
    marginTop: 18,
    gap: 10,
  },
  linkText: {
    color: palette.warmDeep,
    fontWeight: '700',
    fontSize: 14,
  },
  helperText: {
    color: palette.muted,
    fontSize: 13,
  },
  footerNote: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: palette.line,
  },
  footerNoteText: {
    flex: 1,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});