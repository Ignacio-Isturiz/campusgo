import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  background: '#0a0a0a',
  surface: '#121212',
  primary: '#FFFFFF',
  secondary: 'rgba(255, 255, 255, 0.7)',
  muted: 'rgba(255, 255, 255, 0.4)',
  green: '#25D366',
};

interface MarketplaceCardProps {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  imageUrl: string;
  caption: string;
  price?: string;
  phone?: string; // seller phone in international format (e.g. 573001234567)
  authorId?: string;
  currentUserId?: string | null;
  onDeleteSuccess?: (id: string) => void;
  title?: string | null;
}

export default function MarketplaceCard({ id, author, handle, avatar, imageUrl, caption, price, phone, authorId, currentUserId, onDeleteSuccess, title }: MarketplaceCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleContact = async () => {
    if (!phone) return Alert.alert('Teléfono no disponible', 'El vendedor no ha agregado un número de contacto.');

    // Ensure phone is digits only
    const sanitized = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent('Hola, soy de Unaula y estoy interesado en tu producto!');
    const url = `https://wa.me/${sanitized}?text=${text}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('No se puede abrir WhatsApp', 'Tu dispositivo no puede abrir WhatsApp.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
  };

  return (
    <View style={[styles.card, { marginHorizontal: isMobile ? 0 : 16 }]}>
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{author}</Text>
          <Text style={styles.username}>{handle}</Text>
        </View>

        {currentUserId && authorId && currentUserId === authorId ? (
          <TouchableOpacity onPress={async () => {
            const confirmed = await new Promise<boolean>((resolve) => {
              Alert.alert('Eliminar producto', '¿Deseas eliminar este producto?', [
                { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
              ]);
            });
            if (!confirmed) return;

            try {
              const token = await import('@/src/utils/storage').then(m => m.getToken());
              if (!token) return Alert.alert('Error', 'No autenticado');
              const { deletePost } = await import('@/src/services/postService');
              await deletePost(id, token);
              if (typeof onDeleteSuccess === 'function') onDeleteSuccess(id);
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }}>
            <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
          </TouchableOpacity>
        ) : null}
      </View>

      {!!imageUrl && (
        <View style={styles.postImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        </View>
      )}

      {title ? (
        <Text style={[styles.name, { marginTop: 10, marginHorizontal: 0 }]}>{title}</Text>
      ) : null}

      <View style={styles.actions}>
        <View style={{ flex: 1 }} />

        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]} onPress={handleContact} activeOpacity={0.8}>
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={[styles.contactText, { color: '#fff', marginLeft: 8 }]}>Contactar</Text>
        </TouchableOpacity>
      </View>

      {price ? <Text style={styles.priceText}>{price}</Text> : null}

      {!!caption && (
        <Text style={styles.text}>{caption}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    marginRight: 10,
  },
  name: {
    color: '#fff',
    fontWeight: '700',
  },
  username: {
    color: '#999',
    marginTop: 2,
  },
  imageContainer: { position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', aspectRatio: 1 },
  mainImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  actionBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.green, borderRadius: 24 },
  contactText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  captionSection: { paddingHorizontal: 12, paddingVertical: 8 },
  priceText: { fontSize: 16, color: colors.primary, fontWeight: '700', marginBottom: 6 },
  postImageWrapper: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  postImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#111',
  },
  captionContainer: { flexDirection: 'row', marginBottom: 4 },
  text: { color: '#fff', marginTop: 12, lineHeight: 22 },
  footer: { paddingHorizontal: 12, paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  timeAgo: { fontSize: 11, color: colors.muted },
});
