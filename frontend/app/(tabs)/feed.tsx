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
} from 'react-native';

import PostCard from '@/components/feed/PostCard';

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
  const [posts, setPosts] = useState<any[]>(
    []
  );

  const [modalVisible, setModalVisible] =
    useState(false);

  const [token, setToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
        if (savedUser && savedUser.id) {
          setCurrentUserId(savedUser.id);
        }

        // cargar feed
        const data = await getFeed(
          savedToken
        );

        setPosts(data);
      } catch (error) {
        console.log(error);
      }
    };

    initialize();

    // sockets realtime
    socket.on('newPost', post => {
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
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.postWrapper}>
            <View style={styles.postInner}>
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
        showsVerticalScrollIndicator={
          false
        }
      />

      {/* botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          setModalVisible(true)
        }
      >
        <Text style={styles.fabText}>
          +
        </Text>
      </TouchableOpacity>

      {/* modal crear post */}
      <CreatePostModal
        visible={modalVisible}
        onClose={() =>
          setModalVisible(false)
        }
        onSubmit={handleCreatePost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,

    width: 64,
    height: 64,

    borderRadius: 999,

    backgroundColor: '#4DA6FF',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginTop: -2,
  },
  postWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  postInner: {
    width: '100%',
    maxWidth: 640,
  },
});
