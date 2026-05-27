import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';
import { getToken } from '@/src/utils/storage';
import { deletePost as apiDeletePost } from '@/src/services/postService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Props = {
  post: any;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onDeleteSuccess?: (id: string) => void;
  currentUserId?: string | null;
  mode?: 'feed' | 'marketplace';
};

export default function PostCard({
  post,
  onLike,
  onDelete,
  onDeleteSuccess,
  currentUserId,
  mode,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isMobile = width < 680;
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  const colors = {
    surface: theme.surface,
    surfaceAlt: theme.surfaceAlt,
    text: theme.text,
    textMuted: theme.textMuted,
    border: theme.border,
    tint: theme.tint,
  };
  const isAuthor =
    !!currentUserId &&
    (post.userId && (post.userId.id || post.userId._id || post.userId)) === currentUserId;

  const liked = !!(currentUserId && post.likes?.some((id: any) => {
    const idStr = typeof id === 'string' ? id : String(id);
    return idStr === currentUserId;
  }));
  const likeCount = post.likesCount ?? post.likes?.length ?? 0;

  const handleContact = async () => {
    const phone = post.userId?.phone;
    if (!phone) return Alert.alert('Teléfono no disponible', 'El vendedor no ha agregado un número de contacto.');

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

  useEffect(() => {
    if (!post?.imageUrl || !containerWidth) {
      setImageHeight(null);
      return;
    }

    try {
      Image.getSize(
        post.imageUrl,
        (w, h) => {
          const ratio = h / w;
          const computed = Math.round(containerWidth * ratio);
          // Threads-like display: keep images readable but not gigantic
          const final = Math.max(180, Math.min(420, computed));
          setImageHeight(final);
        },
        () => {
          setImageHeight(260);
        }
      );
    } catch (e) {
      setImageHeight(260);
    }
  }, [post?.imageUrl, containerWidth]);
  return (
    <View
      style={[
        styles.card,
        isWeb ? styles.cardWeb : isMobile ? styles.cardMobile : {},
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={
            post.userId?.photoUrl
              ? { uri: post.userId.photoUrl }
              : require('@/assets/images/fotosinperfil.png')
          }
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          {(() => {
            const displayName = post.userId?.displayName;
            const username = post.userId?.username;
            const email = post.userId?.email;

            function parseNameFromEmail(emailStr: string) {
              try {
                const localPart = emailStr.split('@')[0];
                const namePart = localPart.replace(/[0-9]/g, '');
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

            const authorName =
              displayName && displayName.trim().length > 0
                ? displayName
                : username || (email ? parseNameFromEmail(email) : 'Usuario');

            return (
              <>
                <Text style={[styles.name, isWeb && styles.nameWeb, { color: colors.text }]}>{authorName}</Text>

                <Text style={[styles.username, isWeb && styles.usernameWeb, { color: colors.textMuted }]}>
                  {email || 'correo@institucional.edu'}
                </Text>
              </>
            );
          })()}
        </View>
      </View>

      {!!post.text && (
        <Text style={[styles.text, { color: colors.text }]}>
          {post.text}
        </Text>
      )}

      {!!post.imageUrl && (
        <View
          style={styles.postImageWrapper}
          onLayout={e => {
            const w = e.nativeEvent.layout.width;
            setContainerWidth(w);
          }}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={() => setImageModalVisible(true)}>
            <Image
              source={{ uri: post.imageUrl }}
              style={[
                styles.postImage,
                imageHeight ? { height: imageHeight } : {},
                { backgroundColor: colors.surfaceAlt },
              ]}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <Modal visible={imageModalVisible} animationType="fade" transparent>
            <Pressable style={styles.imageModalOverlay} onPress={() => setImageModalVisible(false)}>
              <View style={styles.imageModalContent}>
                <Image source={{ uri: post.imageUrl }} style={styles.imageFull} resizeMode="contain" />
                <TouchableOpacity style={styles.imageCloseBtn} onPress={() => setImageModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>
      )}

      <View style={styles.actions}>
        {/** show contact button for marketplace mode, otherwise like */}
        {(mode === 'marketplace') ? (
          <TouchableOpacity onPress={handleContact}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={[styles.action, { marginLeft: 8, color: colors.text }]}>Contactar</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onLike(post._id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#ff4d4d' : '#888'} />
            <Text style={[styles.action, isWeb && styles.actionWeb, { color: colors.textMuted }, liked ? { color: '#ff4d4d' } : {}]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        )}

        {/* show delete only for the author of the post */}
        {isAuthor && (
          <TouchableOpacity
            onPress={() => {
              setDeleteModalVisible(true);
            }}
            accessibilityLabel="Eliminar publicación"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={deleting}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
          </TouchableOpacity>
        )}
      </View>

      {/* delete confirmation modal */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteModalVisible(false)}>
          <Pressable style={[styles.confirmModal, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Eliminar publicación</Text>
            <Text style={[styles.confirmMessage, { color: colors.textMuted }]}>¿Estás segura de eliminar esta publicación?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnNo, { backgroundColor: colors.surface }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.confirmBtnTextNo, { color: colors.text }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnYes]}
                onPress={async () => {
                  setDeleteModalVisible(false);
                  setDeleting(true);
                  try {
                    const token = await getToken();
                    if (!token) {
                      Alert.alert('Error', 'No autenticado');
                      setDeleting(false);
                      return;
                    }
                    await apiDeletePost(post._id, token);
                    if (onDeleteSuccess) onDeleteSuccess(post._id);
                  } catch (err: any) {
                    console.log('delete error', err);
                    Alert.alert('Error', err?.message || 'No se pudo eliminar');
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                <Text style={styles.confirmBtnTextYes}>Sí</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
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
    fontWeight: '700',
  },

  username: {
    marginTop: 2,
  },

  text: {
    marginTop: 12,
    lineHeight: 22,
  },

  postImage: {
    width: '100%',
    height: 260,
    marginTop: 0,
    borderRadius: 12,
  },

  postImageWrapper: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },

  cardWeb: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    padding: 16,
  },
  cardMobile: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  nameWeb: {},

  usernameWeb: {},

  actionWeb: {},

  actions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 20,
  },

  action: {
  },

  delete: {
    color: '#ff4d4d',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageFull: {
    width: '100%',
    height: '100%',
  },

  imageCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'transparent',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmModal: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
  },

  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  confirmBtnNo: {
  },

  confirmBtnYes: {
    backgroundColor: '#ff4d4d',
  },

  confirmBtnTextNo: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  confirmBtnTextYes: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
