import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  marketplaceOnly?: boolean;
  bienestarOnly?: boolean;
};

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
  marketplaceOnly = false,
  bienestarOnly = false,
}: Props) {
  const windowHeight = Dimensions.get('window').height;
  const [text, setText] = useState('');
  const [title, setTitle] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // validation for marketplace mode
    if (marketplaceOnly) {
      if (!title || !title.trim() || !text || !text.trim() || !price || !price.trim()) return;
      // ensure price is numeric
      if (isNaN(Number(price))) return;
    }

    const payload: any = { text };
    if (title && title.trim().length > 0) payload.title = title.trim();
    if (marketplaceOnly && price && price.trim().length > 0) payload.price = Number(price);
    if (marketplaceOnly) payload.isMarketplace = true;
    if (bienestarOnly) payload.isBienestar = true;
    if (imageBase64) {
      payload.base64 = imageBase64;
      payload.fileName = fileName || `post_${Date.now()}.jpg`;
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (e) {
      console.warn('submit error', e);
    } finally {
      setSubmitting(false);
      // reset and close
      setText('');
      setTitle(null);
      setPrice(null);
      setImageUri(null);
      setImageBase64(null);
      onClose();
    }
  };

  const handleClose = () => {
    setText('');
    setImageUri(null);
    setImageBase64(null);
    onClose();
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: !bienestarOnly,
        aspect: bienestarOnly ? undefined : [4, 3],
        quality: 0.7,
        base64: Platform.OS === 'web' ? false : true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      setImageUri(uri);

      // derive filename with proper extension
      let ext = 'jpg';
      if (asset.type === 'video') ext = 'mp4';
      else if (uri) {
        const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (match) ext = match[1];
      }
      setFileName(`post_${Date.now()}.${ext}`);

      // set preview aspect ratio from asset info if available
      if (asset.width && asset.height) {
        setPreviewAspectRatio(asset.width / asset.height);
      } else {
        // try Image.getSize as fallback
        try {
          Image.getSize(uri, (w, h) => {
            setPreviewAspectRatio(w / h);
          });
        } catch (e) {
          setPreviewAspectRatio(null);
        }
      }

      // convert to base64 — prefer asset.base64 from the picker, fallback to FileSystem
      let b64: string | null = null;
      if (asset.base64) {
        b64 = asset.base64;
      } else if (Platform.OS === 'web') {
        try {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          b64 = dataUrl.split(',')[1];
        } catch (e) {
          console.warn('web base64 fallback failed', e);
        }
      } else {
        try {
          b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        } catch (e) {
          console.warn('FileSystem.readAsStringAsync failed', e);
        }
      }
      setImageBase64(b64);
    } catch (err) {
      console.warn('Error picking image', err);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setFileName(null);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalPanelWrap}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <View style={[styles.modalPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
            <View style={[styles.headerModal, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.headerAction, { color: theme.textMuted }]}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {bienestarOnly ? 'Nueva publicación de bienestar' : marketplaceOnly ? 'Nuevo producto' : 'Nuevo hilo'}
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || (marketplaceOnly ? !(title && title.trim() && text && text.trim() && price && price.trim() && !isNaN(Number(price))) : !(text.trim().length > 0 || imageBase64))}
          >
            <Text
              style={[
                styles.headerAction,
                { color: theme.tint },
                (submitting || (marketplaceOnly ? !(title && title.trim() && text && text.trim() && price && price.trim()) : !(text.trim().length > 0 || imageBase64 || (price && price.trim().length > 0)))) && { opacity: 0.4 },
              ]}
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </Text>
          </TouchableOpacity>
        </View>

        {marketplaceOnly ? (
          <>
            <TextInput
              placeholder="Título del producto"
              placeholderTextColor={theme.textMuted}
              value={title || ''}
              onChangeText={setTitle}
              style={[styles.input, styles.inputCompact, { marginTop: 8, color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            />

            <TextInput
              placeholder={'Descripción del producto'}
              placeholderTextColor={theme.textMuted}
              multiline
              value={text}
              onChangeText={setText}
              style={[styles.input, styles.inputPanelCompact, { marginTop: 8, color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            />

            <TextInput
              placeholder="Precio"
              placeholderTextColor={theme.textMuted}
              value={price || ''}
              onChangeText={(v) => setPrice(v.replace(/[^0-9.,]/g, ''))}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              style={[styles.input, styles.inputCompact, { marginTop: 8, color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            />
          </>
        ) : (
          <>
            <TextInput
              placeholder={'¿Qué novedades tienes?'}
              placeholderTextColor={theme.textMuted}
              multiline
              value={text}
              onChangeText={setText}
              style={[styles.input, styles.inputPanel, { marginTop: 8, color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            />
          </>
        )}

        <View style={styles.toolbar}>
          <TouchableOpacity onPress={handlePickImage} style={[styles.iconBtn, styles.iconBtnPrimary, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]} accessibilityLabel="Adjuntar imagen o video">
            <Ionicons name="image-outline" size={22} color={theme.tint} />
            <Text style={[styles.iconBtnText, { color: theme.tint }]}>Agregar imagen</Text>
          </TouchableOpacity>
        </View>

              {imageUri && (
                <View style={styles.preview}>
                  <View style={styles.previewInner}>
                    <Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.previewImage,
                        { height: Math.min(windowHeight * 0.45, 520) },
                      ]}
                      resizeMode="contain"
                    />

                    <TouchableOpacity onPress={handleRemoveImage} style={styles.removeOverlayBtn} accessibilityLabel="Quitar imagen">
                      <Text style={styles.removeOverlayText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
  </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },

  input: {
    fontSize: 18,
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  button: {
    backgroundColor: '#4DA6FF',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  cancel: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  headerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },

  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
  },

  headerAction: {
    fontWeight: '600',
  },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  iconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  iconBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  preview: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
    maxHeight: 360,
    overflow: 'hidden',
  },
  previewInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  previewImage: {
    width: '100%',
    borderRadius: 12,
    height: undefined,
  },

  removeBtn: {
    marginTop: 8,
  },

  removeText: {
    color: '#ff6b6b',
  },
  removeOverlayBtn: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalPanelWrap: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },

  modalPanel: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    maxHeight: '92%',
    borderWidth: 1,
  },

  modalContent: {
    paddingBottom: 28,
  },

  inputPanel: {
    minHeight: 120,
  },
  inputCompact: {
    height: 40,
    minHeight: 40,
    fontSize: 15,
  },
  inputPanelCompact: {
    minHeight: 80,
    maxHeight: 120,
    fontSize: 15,
  },
});