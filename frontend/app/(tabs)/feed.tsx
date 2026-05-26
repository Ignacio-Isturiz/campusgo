import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from 'react-native';

import PostCard from '@/components/feed/PostCard';
import { Ionicons } from '@expo/vector-icons';
// BottomNavigation removed per user request
import { Platform, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import CreatePostModal from '@/components/feed/CreatePostModal';

import {
  getFeed,
  createPost,
  toggleLike,
  deletePost,
} from '@/src/services/postService';

import socket from '@/src/services/socket';

import { getToken } from '@/src/utils/storage';
import { getUser } from '@/src/utils/storage';

export default function FeedScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 680;
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  const [posts, setPosts] = useState<any[]>(
    []
  );

  const [modalVisible, setModalVisible] =
    useState(false);

  const [token, setToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // obtener token guardado
        const savedToken =
          await getToken();

        if (!savedToken) {
          console.log(
            'No hay token guardado'
          );

          return;
        }

        // guardar token en estado
        setToken(savedToken);

        // obtener usuario guardado para verificar permisos de delete
        const savedUser = await getUser();
        if (savedUser) {
          if (savedUser.id) setCurrentUserId(savedUser.id);
          const photo = savedUser.photoUrl || savedUser.photo || savedUser.avatar || null;
          if (photo) setUserPhoto(photo);
        }

        // cargar feed
        const data = await getFeed(savedToken);
        // exclude marketplace items from main feed so products only appear in Marketplace
        setPosts(Array.isArray(data) ? data.filter((p: any) => !p.isMarketplace) : []);
      } catch (error) {
        console.log(error);
      }
    };

    initialize();

    // sockets realtime
    socket.on('newPost', post => {
      // ignore marketplace posts in regular feed
      if (post && post.isMarketplace) return;
      setPosts(prev => [post, ...prev]);
    });

    socket.on(
      'deletePost',
      postId => {
        setPosts(prev =>
          prev.filter(
            p => p._id !== postId
          )
        );
      }
    );

    socket.on(
      'updateLike',
      updated => {
        setPosts(prev =>
          prev.map(post =>
            post._id === updated.postId
              ? {
                  ...post,
                  likesCount:
                    updated.likesCount,
                }
              : post
          )
        );
      }
    );

        return () => {
      socket.off('newPost');

      socket.off('deletePost');

      socket.off('updateLike');
    };
  }, []);

  // crear post
  const handleCreatePost =
    async (data: any) => {
      try {
        if (!token) return;

        await createPost(data, token);
      } catch (error) {
        console.log(error);
      }
    };

  // like
  const handleLike = async (
    postId: string
  ) => {
    try {
      if (!token) return;

      await toggleLike(postId, token);
    } catch (error) {
      console.log(error);
    }
  };

  // eliminar: callback que el child llama tras borrar en el backend
  const handleDeleteSuccess = (postId: string) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  // delete with confirmation and token (used when passed as onDelete)
  const handleDelete = (postId: string) => {
    Alert.alert(
      'Eliminar publicación',
      '¿Seguro que deseas eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!token) {
                console.log('No token');
                return;
              }

              await deletePost(postId, token);

              // remove locally
              setPosts(prev => prev.filter(p => p._id !== postId));
            } catch (err) {
              console.log('delete error', err);
              Alert.alert('Error', err?.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  

  return (
    <View style={styles.page}>

      <View style={[styles.container, isMobile ? styles.containerMobile : {}, { backgroundColor: theme.background }]}>
        <View style={styles.feedHeader}>
          <Text style={[styles.feedTitle, { color: theme.text }]}>Feed</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.publishBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.publishText}>+ Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick composer row - alternate way to open create modal */}
        <TouchableOpacity style={[styles.composeRow, { backgroundColor: colorScheme === 'dark' ? '#141516' : '#ffffff', borderColor: colorScheme === 'dark' ? '#222' : '#eee' }]} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          {userPhoto ? (
            <Image source={{ uri: userPhoto }} style={styles.composeAvatar} />
          ) : (
            <Ionicons name="person-circle" size={36} color="#888" />
          )}
          <Text style={[styles.composePlaceholder, { color: theme.icon }]}>¿Qué quieres compartir hoy?</Text>
        </TouchableOpacity>

        <FlatList
          data={posts}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.postWrapper}>
              <View style={[styles.postInner, isMobile ? styles.postInnerMobile : {}]}>
                <PostCard
                  post={item}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onDeleteSuccess={handleDeleteSuccess}
                  currentUserId={currentUserId}
                />
              </View>
            </View>
          )}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 120,
            }}
          showsVerticalScrollIndicator={false}
        />

        <CreatePostModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleCreatePost}
        />

        {/* FAB removed per request */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flexDirection: 'row', width: '100%', height: '100%' },
  sidebarContainer: { display: 'none' as any /* show via web-specific styles if needed */ },
  container: { flex: 1 },

  fab: {
    // removed
  },

  fabText: {
    // removed
  },
  postWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  postInner: {
    width: '100%',
    maxWidth: 840,
  },
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  feedTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  publishBtn: { backgroundColor: '#ff7a00', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  publishText: { color: '#fff', fontWeight: '700' },
  containerMobile: { paddingHorizontal: 8 },
  postInnerMobile: { maxWidth: '100%', paddingHorizontal: 8 },
  composeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  composeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
  },
  composePlaceholder: {
    marginLeft: 10,
    fontSize: 15,
  },
});
