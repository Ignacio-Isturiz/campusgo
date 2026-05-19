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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/src/utils/storage';
import { deletePost as apiDeletePost } from '@/src/services/postService';

type Props = {
  post: any;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onDeleteSuccess?: (id: string) => void;
  currentUserId?: string | null;
};

export default function PostCard({
  post,
  onLike,
  onDelete,
  onDeleteSuccess,
  currentUserId,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const isWeb = Platform.OS === 'web';
  const isAuthor =
    !!currentUserId &&
    (post.userId && (post.userId.id || post.userId._id || post.userId)) === currentUserId;

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
    <View style={[styles.card, isWeb && styles.cardWeb]}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              post.userId?.photoUrl ||
              'https://i.pravatar.cc/150',
          }}
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
                <Text style={[styles.name, isWeb && styles.nameWeb]}>{authorName}</Text>

                <Text style={[styles.username, isWeb && styles.usernameWeb]}>
                  {email || 'correo@institucional.edu'}
                </Text>
              </>
            );
          })()}
        </View>
      </View>

      {!!post.text && (
        <Text style={styles.text}>
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
        <TouchableOpacity
          onPress={() => onLike(post._id)}
        >
          <Text style={[styles.action, isWeb && styles.actionWeb]}>
            ❤️ {post.likesCount}
          </Text>
        </TouchableOpacity>

        {/* commenting is disabled in this phase */}

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
          <Pressable style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Eliminar publicación</Text>
            <Text style={styles.confirmMessage}>¿Estás segura de eliminar esta publicación?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnNo]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.confirmBtnTextNo}>No</Text>
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
                    if (onDelete) onDelete(post._id);
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

  text: {
    color: '#fff',
    marginTop: 12,
    lineHeight: 22,
  },

  postImage: {
    width: '100%',
    height: 260,
    marginTop: 0,
    backgroundColor: '#111',
  },

  postImageWrapper: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },

  cardWeb: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    padding: 16,
  },

  nameWeb: {
    color: '#ffffff',
  },

  usernameWeb: {
    color: '#9ca3af',
  },

  actionWeb: {
    color: '#ffffff',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 20,
  },

  action: {
    color: '#fff',
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
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
  },

  confirmTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  confirmMessage: {
    color: '#999',
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
    backgroundColor: '#2a2a2a',
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
