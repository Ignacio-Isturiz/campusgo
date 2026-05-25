import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MarketplaceCard from '@/components/feed/marketplace-card';
import BottomNavigation from '@/components/feed/bottom-navigation';
import CreatePostModal from '@/components/feed/CreatePostModal';
import { getFeed, createPost } from '@/src/services/postService';
import socket from '@/src/services/socket';
import { getToken, getUser } from '@/src/utils/storage';
import { Ionicons } from '@expo/vector-icons';

export default function MarketplaceScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'add' | 'notifications' | 'profile'>('home');

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) return;
        setToken(savedToken);

        const savedUser = await getUser();
        if (savedUser && savedUser.id) setCurrentUserId(savedUser.id);

        const data = await getFeed(savedToken);
        // filter posts that represent marketplace items: prefer posts with price or allow all
        const marketItems = data.filter((p: any) => p.isMarketplace || p.price || p.title);
        setPosts(marketItems);
      } catch (e) {
        console.log('marketplace init error', e);
      }
    };

    initialize();

    socket.on('newPost', (post: any) => setPosts(prev => [post, ...prev]));
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
      setPosts(prev => [created, ...prev]);
    } catch (err) {
      console.log('create post error', err);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View style={[styles.cardWrapper, { opacity: new Animated.Value(1) }]}> 
      <MarketplaceCard
        id={item._id}
        author={item.userId?.displayName || item.userId?.email || 'Usuario'}
        handle={item.userId?.username || item.userId?.email || ''}
        avatar={item.userId?.photoUrl || 'https://i.pravatar.cc/150'}
        imageUrl={item.imageUrl}
        title={item.title}
        caption={item.text}
        price={item.price}
        phone={item.userId?.phone}
        authorId={item.userId?._id || item.userId?.id}
        currentUserId={currentUserId}
        onDeleteSuccess={(id: string) => setPosts(prev => prev.filter(p => p._id !== id))}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      <View style={styles.feedContainer}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        />
      </View>

      <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleCreatePost} />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ position: 'absolute', right: 18, bottom: 86, backgroundColor: '#4DA6FF', padding: 14, borderRadius: 999 }}
        accessibilityLabel="Agregar producto"
      >
        <Ionicons name="add" size={22} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  feedContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  feedContent: { paddingHorizontal: 0, paddingVertical: 8 },
  cardWrapper: { marginBottom: 12, marginHorizontal: 0 },
});
