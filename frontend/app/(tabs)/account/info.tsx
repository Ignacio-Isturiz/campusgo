import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getUser, saveUser, getPhoto, savePhoto } from '@/src/utils/storage';
import { getToken as getUserToken } from '@/src/utils/storage';
import { accountPalette, commonStyles } from '@/src/components/account/AccountStyles';
import { emit } from '@/src/utils/events';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * Extrae el nombre y apellido del formato nombre.apellido####@unaula.edu.co
 */
function parseNameFromEmail(email: string): string {
  try {
    const localPart = email.split('@')[0];
    const namePart = localPart.replace(/[0-9]/g, ''); // Quitar números
    const parts = namePart.split('.');
    
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${firstName} ${lastName}`;
    }
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  } catch (e) {
    return '';
  }
}

type ProgramOption = {
  level: 'Pregrado' | 'Posgrado';
  kind: 'Tecnologia' | 'Universitario' | 'Especializacion' | 'Maestria';
  name: string;
};

const PROGRAM_OPTIONS: ProgramOption[] = [
  { level: 'Pregrado', kind: 'Universitario', name: 'Administracion de Empresas' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Contaduria Publica' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Derecho' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Economia' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Ingenieria Informatica' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Ingenieria en Ciencia de Datos e Inteligencia de Negocios' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Ingenieria Industrial' },
  { level: 'Pregrado', kind: 'Universitario', name: 'Licenciatura en Ciencias Sociales' },
  { level: 'Pregrado', kind: 'Tecnologia', name: 'Tecnologia en Desarrollo de Software' },
  { level: 'Pregrado', kind: 'Tecnologia', name: 'Tecnologia en Entrenamiento Deportivo' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Alta Gerencia' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Ciberseguridad' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Contratacion Estatal' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Cultura Politica' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Derecho Administrativo' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Derecho Comercial' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Derecho de Familia' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Derecho Minero y Ambiental' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Derecho Procesal Penal' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Gerencia Deportiva' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Gerencia de Mercadeo' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Gerencia Financiera' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Gerencia Logistica' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Legislacion Tributaria' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Politicas Publicas para el Desarrollo' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Regimenes Disciplinarios' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Responsabilidad Civil y del Estado' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Revision Fiscal' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Sostenibilidad y Nuevas Economias' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Analitica de Datos' },
  { level: 'Posgrado', kind: 'Especializacion', name: 'Derecho Laboral y Seguridad Social' },
  { level: 'Posgrado', kind: 'Maestria', name: 'Derecho Administrativo' },
  { level: 'Posgrado', kind: 'Maestria', name: 'Derecho Procesal Penal y Teoria del Delito' },
  { level: 'Posgrado', kind: 'Maestria', name: 'Educacion y Derechos Humanos' },
  { level: 'Posgrado', kind: 'Maestria', name: 'Gerencia' },
  { level: 'Posgrado', kind: 'Maestria', name: 'Tributacion y Derecho Tributario' },
];

const PROGRAM_SECTIONS = [
  { level: 'Pregrado', kind: 'Tecnologia', title: 'Pregrado / Tecnologia' },
  { level: 'Pregrado', kind: 'Universitario', title: 'Pregrado / Universitario' },
  { level: 'Posgrado', kind: 'Especializacion', title: 'Posgrado / Especializacion' },
  { level: 'Posgrado', kind: 'Maestria', title: 'Posgrado / Maestria' },
];

const formatProgram = (opt: ProgramOption) => `${opt.level} / ${opt.kind} / ${opt.name}`;

const InputField = ({ label, value, onChangeText, placeholder, multiline = false, editable = false, keyboardType }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
          multiline && styles.textArea,
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        selectTextOnFocus={editable}
        placeholder={placeholder}
        multiline={multiline}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
      />
      {multiline && <Text style={[styles.charCount, { color: theme.textMuted }]}>{value.length}/120</Text>}
    </View>
  );
};

export default function InfoScreen() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    program: '',
    semester: '',
    description: '',
    phone: '',
  });
  // Load persisted user and ensure fields are not editable
  const [photo, setPhoto] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<{ base64: string; fileName: string } | null>(null);
  const [programOpen, setProgramOpen] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;

  const loadData = async () => {
    const user = await getUser();
    const savedPhoto = await getPhoto();

    if (user && user.email) {
      const displayName = user.displayName || parseNameFromEmail(user.email);
      setForm((prev) => ({
        ...prev,
        email: user.email,
        name: prev.name || displayName,
        phone: user.phone || '',
      }));
    }

    if (savedPhoto && !savedPhoto.startsWith('blob:')) {
      setPhoto(savedPhoto);
    } else {
      setPhoto(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  async function uriToBase64(u: string) {
    const resp = await fetch(u);
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await savePhoto(uri);
      // Convert to base64 and store in state; actual upload happens on "Guardar"
      try {
        const base64 = await uriToBase64(uri);
        const fileName = `profile_${Date.now()}.jpg`;
        setPendingPhoto({ base64, fileName });
      } catch (err) {
        console.warn('Could not convert photo to base64:', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      const stored = await getUser();
      const merged = stored ? { ...stored, ...form } : { ...form };

      try {
        const token = await getUserToken();
        if (token) {
          const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://campusgo-jjzy.onrender.com';

          // 1. Upload photo if there's a pending one
          if (pendingPhoto) {
            const photoRes = await fetch(`${API_URL}/auth/profile/photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(pendingPhoto),
            });

            if (photoRes.ok) {
              const photoData = await photoRes.json();
              if (photoData.user?.photoUrl) {
                merged.photoUrl = photoData.user.photoUrl;
                await savePhoto(photoData.user.photoUrl);
                setPhoto(photoData.user.photoUrl);
                emit('photo:changed', photoData.user.photoUrl);
              }
            }
            setPendingPhoto(null);
          }

          // 2. Save profile (displayName, phone)
          const r = await fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ displayName: merged.name, phone: merged.phone }),
          });

          if (r.ok) {
            const data = await r.json();
            if (data.user) {
              const userToSave = { ...data.user };
              // preserve the photoUrl we just uploaded
              if (merged.photoUrl && data.user.photoUrl !== merged.photoUrl) {
                userToSave.photoUrl = merged.photoUrl;
              }
              await saveUser(userToSave);
            } else {
              await saveUser(merged);
            }
          } else {
            await saveUser(merged);
          }
        } else {
          await saveUser(merged);
        }
      } catch (e) {
        await saveUser(merged);
      }
    } catch (e) {
      await saveUser(form);
    }
    router.replace('/(tabs)/mi-cuenta')
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/mi-cuenta')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mi información</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveBtnText, { color: theme.tint }]}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <Image
              source={photo ? { uri: photo } : require('@/assets/images/fotosinperfil.png')}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickImage}>
              <Text style={[styles.changePhotoText, { color: theme.tint }]}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <InputField
              label="Nombre completo"
              value={form.name}
              onChangeText={(text: string) => setForm({ ...form, name: text })}
              placeholder="Tu nombre"
            />
            <InputField
              label="Correo institucional"
              value={form.email}
              onChangeText={(text: string) => setForm({ ...form, email: text })}
              placeholder="correo@unaula.edu.co"
            />
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Programa academico</Text>
              <TouchableOpacity
                style={[
                  styles.selectInput,
                  { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                ]}
                onPress={() => setProgramOpen(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectText,
                    { color: form.program ? theme.text : theme.textMuted },
                  ]}
                  numberOfLines={2}
                >
                  {form.program || 'Selecciona un programa'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <InputField
              label="Teléfono"
              value={form.phone}
              onChangeText={(text: string) => setForm({ ...form, phone: text.replace(/[^0-9]/g, '') })}
              placeholder="Ej. 573001234567"
              editable
              keyboardType="phone-pad"
            />
            <InputField
              label="Semestre"
              value={form.semester}
              onChangeText={(text: string) => setForm({ ...form, semester: text })}
              placeholder="Ej. 6° semestre"
            />
            <InputField
              label="Descripción"
              value={form.description}
              onChangeText={(text: string) => setForm({ ...form, description: text })}
              placeholder="Cuéntanos sobre ti..."
              multiline
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={programOpen} transparent animationType="fade">
        <Pressable style={styles.programOverlay} onPress={() => setProgramOpen(false)}>
          <Pressable style={[styles.programSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <View style={styles.programHeader}>
              <Text style={[styles.programTitle, { color: theme.text }]}>Programas academicos</Text>
              <TouchableOpacity onPress={() => setProgramOpen(false)}>
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {PROGRAM_SECTIONS.map((section) => {
                const items = PROGRAM_OPTIONS.filter(
                  (opt) => opt.level === section.level && opt.kind === section.kind,
                );
                return (
                  <View key={section.title} style={styles.programSection}>
                    <Text style={[styles.programSectionTitle, { color: theme.textMuted }]}>{section.title}</Text>
                    {items.map((opt) => {
                      const value = formatProgram(opt);
                      const isSelected = form.program === value;
                      return (
                        <TouchableOpacity
                          key={value}
                          style={[
                            styles.programOption,
                            { borderColor: theme.border },
                            isSelected && { backgroundColor: theme.surfaceAlt, borderColor: theme.tint },
                          ]}
                          onPress={() => {
                            setForm((prev) => ({ ...prev, program: value }));
                            setProgramOpen(false);
                          }}
                        >
                          <Text style={[styles.programOptionText, { color: theme.text }]}>{value}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: accountPalette.text,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: accountPalette.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },
  changePhotoBtn: {
    paddingVertical: 6,
  },
  changePhotoText: {
    color: accountPalette.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: accountPalette.textMuted,
    marginLeft: 4,
  },
  input: {
    height: 56,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: accountPalette.text,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  selectInput: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  programOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  programSheet: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  programSection: {
    marginBottom: 14,
  },
  programSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  programOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  programOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: accountPalette.textMuted,
    marginTop: 4,
  },
});
