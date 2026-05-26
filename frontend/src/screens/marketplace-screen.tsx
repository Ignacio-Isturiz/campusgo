import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Animated, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/feed/PostCard';
import { Platform, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
// BottomNavigation removed per user request
import CreatePostModal from '@/components/feed/CreatePostModal';
import { getMarketplace, createPost, toggleLike, deletePost } from '@/src/services/postService';
import socket from '@/src/services/socket';
import { getToken, getUser } from '@/src/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

export default function MarketplaceScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 680;
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  const [posts, setPosts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'add' | 'notifications' | 'profile'>('home');

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) return;
        setToken(savedToken);

        const savedUser = await getUser();
        if (savedUser) {
          if (savedUser.id) setCurrentUserId(savedUser.id);
          const photo = savedUser.photoUrl || savedUser.photo || savedUser.avatar || null;
          if (photo) setUserPhoto(photo);
        }

        const data = await getMarketplace(savedToken);
        setPosts(data);
      } catch (e) {
        console.log('marketplace init error', e);
      }
    };

    initialize();

    socket.on('newPost', (post: any) => {
      setPosts(prev => {
        if (!post) return prev;
        // ignore duplicates
        if (prev.some(p => p._id === post._id)) return prev;
        if (post.isMarketplace || post.price || post.title) return [post, ...prev];
        return prev;
      });
    });
    socket.on('deletePost', (postId: string) => setPosts(prev => prev.filter(p => p._id !== postId)));

    return () => {
      socket.off('newPost');
      socket.off('deletePost');
    };
  }, []);

  const handleCreatePost = async (data: any) => {
    try {
      if (!token) return;
      const created = await createPost(data, token);
      // prepend created post so user sees it immediately
      setPosts(prev => {
        if (!created) return prev;
        if (prev.some(p => p._id === created._id)) return prev;
        return [created, ...prev];
      });
    } catch (err) {
      console.log('create post error', err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      if (!token) return;
      await toggleLike(postId, token);
    } catch (e) {
      console.log('like error', e);
    }
  };

  const handleDeleteSuccess = (postId: string) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.postWrapper}>
      <View style={styles.postInner}>
        <Animated.View style={[styles.cardWrapper, { opacity: new Animated.Value(1) }]}> 
          <PostCard
            post={item}
            onLike={handleLike}
            onDeleteSuccess={handleDeleteSuccess}
            currentUserId={currentUserId}
            mode="marketplace"
          />
        </Animated.View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.background || '#faf9f8' }]} edges={['top']}>
      {/* Sidebar removed: using bottom navigation across all sections */}

      <View style={[styles.container, isMobile ? styles.containerMobile : {}, { backgroundColor: theme.background }]}>
        <View style={styles.feedHeader}>
          <Text style={[styles.feedTitle, { color: theme.text }]}>Marketplace</Text>
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

        <View style={[styles.feedContainer, isMobile ? { paddingHorizontal: 8 } : {}]}>
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedContent}
          />
        </View>

        <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleCreatePost} marketplaceOnly />

        
        {/* FAB removed per request */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flexDirection: 'row', width: '100%', height: '100%' },
  sidebarContainer: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  container: { flex: 1 },
  containerMobile: { paddingHorizontal: 8 },
  feedContainer: { flex: 1 },
  feedContent: { padding: 16, paddingBottom: 120 },
  cardWrapper: { marginBottom: 12, marginHorizontal: 0 },
  postWrapper: { width: '100%', alignItems: 'center' },
  postInner: { width: '100%', maxWidth: 840 },
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  feedTitle: { fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  publishBtn: { backgroundColor: '#ff7a00', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  publishText: { color: '#fff', fontWeight: '700' },
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
  composePlaceholder: {
    marginLeft: 10,
    fontSize: 15,
  },
  composeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
  },
});
