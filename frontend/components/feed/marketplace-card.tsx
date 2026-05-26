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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const defaultColors = {
  background: '#fff',
  surface: '#fff',
  primary: '#111',
  secondary: '#687076',
  muted: 'rgba(0,0,0,0.4)',
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
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] ?? defaultColors;
  const colors = {
    background: theme.background,
    surface: theme.background,
    primary: theme.text,
    secondary: theme.icon,
    muted: 'rgba(0,0,0,0.4)',
    green: '#25D366',
  };

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
    <View style={[styles.card, { marginHorizontal: isMobile ? 0 : 16, backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.primary }]}>{author}</Text>
          <Text style={[styles.username, { color: colors.secondary }]}>{handle}</Text>
        </View>
      </View>

      {title ? (
        <Text style={[styles.name, { marginTop: 10 }]}>{title}</Text>
      ) : null}

      {!!imageUrl && (
        <View style={styles.postImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.green || '#25D366' }]} onPress={handleContact} activeOpacity={0.8}>
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={[styles.contactText, { color: '#fff' }]}>Contactar</Text>
        </TouchableOpacity>

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
          }} style={{ marginLeft: 20 }}>
            <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
          </TouchableOpacity>
        ) : null}
      </View>

      {price ? <Text style={[styles.priceText, { marginTop: 10, color: colors.primary }]}>{price}</Text> : null}

      {!!caption && (
        <Text style={[styles.text, { color: colors.primary }]}>{caption}</Text>
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
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    gap: 12,
  },
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
