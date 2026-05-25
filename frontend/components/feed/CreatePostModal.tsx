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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [isMarketplace, setIsMarketplace] = useState<boolean>(false);

  const handleSubmit = () => {
    const payload: any = { text };
    if (title && title.trim().length > 0) payload.title = title.trim();
    if (price && price.trim().length > 0) payload.price = price.trim();
    if (isMarketplace) payload.isMarketplace = true;
    if (imageBase64) {
      payload.base64 = imageBase64;
      payload.fileName = fileName || `post_${Date.now()}.jpg`;
    }
    onSubmit(payload);

    // reset and close
    setText('');
    setTitle(null);
    setImageUri(null);
    setImageBase64(null);
    onClose();
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
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
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

      // convert to base64
        if (Platform.OS === 'web') {
        // fetch blob and convert to dataUrl
        const resp = await fetch(uri);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        setImageBase64(dataUrl.split(',')[1]);
      } else {
        const FileSystem = await import('expo-file-system');
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        setImageBase64(base64);
      }
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
        <View style={styles.modalPanel}>
        <View style={styles.headerModal}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerAction}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Nuevo hilo</Text>

          <TouchableOpacity
            onPress={handleSubmit}
              disabled={!(text.trim().length > 0 || imageBase64 || (price && price.trim().length > 0))}
          >
            <Text
              style={[
                styles.headerAction,
                  !(text.trim().length > 0 || imageBase64 || (price && price.trim().length > 0)) && { opacity: 0.4 },
              ]}
            >
              Publicar
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="¿Qué novedades tienes?"
          placeholderTextColor="#666"
          multiline
          value={text}
          onChangeText={setText}
          style={[styles.input, styles.inputPanel]}
        />

        <TextInput
          placeholder="Título del producto (opcional)"
          placeholderTextColor="#666"
          value={title || ''}
          onChangeText={setTitle}
          style={[styles.input, { marginTop: 8, height: 44 }]}
        />

        <TextInput
          placeholder="Precio (opcional)"
          placeholderTextColor="#666"
          value={price || ''}
          onChangeText={setPrice}
          keyboardType="default"
          style={[styles.input, { marginTop: 8, height: 44 }]}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity onPress={() => setIsMarketplace(!isMarketplace)} style={{ marginRight: 8 }}>
            <Text style={{ color: isMarketplace ? '#4DA6FF' : '#666', fontWeight: '600' }}>{isMarketplace ? 'Vender en Marketplace' : 'No marcar como venta'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity onPress={handlePickImage} style={styles.iconBtn} accessibilityLabel="Adjuntar imagen o video">
            <Ionicons name="image-outline" size={22} color="#4DA6FF" />
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.preview}>
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.previewImage,
                previewAspectRatio ? { aspectRatio: previewAspectRatio } : { height: 320 },
              ]}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removeBtn}>
              <Text style={styles.removeText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    color: '#111',
    fontSize: 18,
    minHeight: 140,
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
    borderBottomColor: '#222',
    marginBottom: 12,
  },

  headerTitle: {
    color: '#111',
    fontWeight: '700',
    fontSize: 16,
  },

  headerAction: {
    color: '#4DA6FF',
    fontWeight: '600',
  },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  iconBtn: {
    padding: 8,
  },

  preview: {
    marginTop: 12,
    alignItems: 'center',
  },

  previewImage: {
    width: '100%',
    borderRadius: 12,
  },

  removeBtn: {
    marginTop: 8,
  },

  removeText: {
    color: '#ff6b6b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  modalPanel: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    maxHeight: '90%'
  },

  inputPanel: {
    color: '#111',
    minHeight: 120,
  },
});