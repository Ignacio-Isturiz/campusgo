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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getUser, saveUser, getPhoto, savePhoto } from '@/src/utils/storage';
import { getToken as getUserToken } from '@/src/utils/storage';
import { accountPalette, commonStyles } from '@/src/components/account/AccountStyles';

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

const InputField = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      editable={false}
      selectTextOnFocus={false}
      placeholder={placeholder}
      multiline={multiline}
      placeholderTextColor="#999"
    />
    {multiline && <Text style={styles.charCount}>{value.length}/120</Text>}
  </View>
);

export default function InfoScreen() {
  const [form, setForm] = useState({
    name: 'Juan David Pérez',
    email: 'correo@unaula.edu.co',
    program: 'Ingeniería de Sistemas',
    semester: '6° semestre',
    description: 'Apasionado por la tecnología y el desarrollo de software.',
  });
  // Load persisted user and ensure fields are not editable
  const [photo, setPhoto] = useState<string | null>(null);

  const loadData = async () => {
    const user = await getUser();
    const savedPhoto = await getPhoto();

    if (user && user.email) {
      const suggestedName = parseNameFromEmail(user.email);
      setForm((prev) => ({
        ...prev,
        email: user.email,
        name: prev.name === 'Juan David Pérez' ? (suggestedName || prev.name) : prev.name,
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
      // Upload base64 to backend so it persists and is available on other devices
      try {
        const token = await getUserToken();
        if (token) {
          async function uriToBase64(u: string) {
            if (Platform.OS === 'web') {
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
            const FileSystem = await import('expo-file-system');
            return await FileSystem.readAsStringAsync(u, { encoding: FileSystem.EncodingType.Base64 });
          }

          const base64 = await uriToBase64(uri);
          const fileName = `profile_${Date.now()}.jpg`;

          const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
          const r = await fetch(`${API_URL}/auth/profile/photo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ base64, fileName }),
          });

          if (r.ok) {
            const data = await r.json();
            if (data.user && data.user.photoUrl) {
              await savePhoto(data.user.photoUrl);
              setPhoto(data.user.photoUrl);
              // update saved user object so photoUrl persists when user hits Guardar
              try {
                const stored = await getUser();
                if (stored) {
                  const updated = { ...stored, photoUrl: data.user.photoUrl };
                  await saveUser(updated);
                }
              } catch (e) {
                // non-fatal
                console.warn('Could not update saved user with photoUrl', e);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not upload photo to backend:', err);
      }
    }
  };

  const handleSave = async () => {
    // Merge form data into existing saved user to avoid wiping other fields (eg. photoUrl)
    try {
      const stored = await getUser();
      const merged = stored ? { ...stored, ...form } : { ...form };
      await saveUser(merged);
    } catch (e) {
      // fallback: save form only
      await saveUser(form);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={accountPalette.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi información</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <Image
              source={photo ? { uri: photo } : require('@/assets/images/sinfoto.png')}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickImage}>
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
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
            <InputField
              label="Programa académico"
              value={form.program}
              onChangeText={(text: string) => setForm({ ...form, program: text })}
              placeholder="Ej. Ingeniería de Sistemas"
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
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: accountPalette.textMuted,
    marginTop: 4,
  },
});
