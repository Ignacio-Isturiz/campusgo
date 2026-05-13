import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import FeedHeader from '@/components/feed/feed-header';
import FeedCard from '@/components/feed/feed-card';
import BottomNavigation from '@/components/feed/bottom-navigation';

const { width, height } = Dimensions.get('window');

// Colores modernos
const colors = {
  background: '#0a0a0a',
  surface: '#121212',
  surfaceLight: '#1e1e1e',
  primary: '#FFFFFF',
  secondary: 'rgba(255, 255, 255, 0.7)',
  muted: 'rgba(255, 255, 255, 0.4)',
  accent: '#FF1493',
  secondary_accent: '#00D9FF',
};

// Datos placeholder para las tarjetas del feed
const PLACEHOLDER_FEED_ITEMS = [
  {
    id: '1',
    author: 'Sarah Johnson',
    handle: '@sarahjohns',
    avatar: 'https://i.pravatar.cc/150?img=1',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
    caption: 'El mejor campus experience 🎓 #CampusGO #Education',
    likes: 1243,
    comments: 89,
    shares: 34,
    isLiked: false,
  },
  {
    id: '2',
    author: 'Alex Chen',
    handle: '@alexchen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&h=500&fit=crop',
    caption: 'Campus life be like... 😂✨',
    likes: 2156,
    comments: 234,
    shares: 89,
    isLiked: false,
  },
  {
    id: '3',
    author: 'Emma Wilson',
    handle: '@emmawils',
    avatar: 'https://i.pravatar.cc/150?img=3',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop',
    caption: 'Nuevo evento en el campus! 🎉 Todos invitados',
    likes: 3421,
    comments: 456,
    shares: 123,
    isLiked: false,
  },
  {
    id: '4',
    author: 'Marcus Lee',
    handle: '@marcuslee',
    avatar: 'https://i.pravatar.cc/150?img=4',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    caption: 'Conectando mentes en el campus 🧠💡',
    likes: 987,
    comments: 112,
    shares: 45,
    isLiked: false,
  },
  {
    id: '5',
    author: 'Lisa Park',
    handle: '@lisaparkstudio',
    avatar: 'https://i.pravatar.cc/150?img=5',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop',
    caption: 'Creciendo juntos en la comunidad 🚀',
    likes: 2234,
    comments: 178,
    shares: 67,
    isLiked: false,
  },
];

/**
 * FeedScreen - Feed social principal estilo Instagram moderno
 * Pantalla principal después del login
 * Incluye header, feed de tarjetas y navegación inferior
 */
export default function FeedScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  const [feedItems, setFeedItems] = useState(PLACEHOLDER_FEED_ITEMS);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'add' | 'notifications' | 'profile'>('home');

  // Función para alternar like en una tarjeta
  const handleToggleLike = (id: string) => {
    setFeedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const renderFeedCard = ({ item, index }: { item: (typeof PLACEHOLDER_FEED_ITEMS)[0]; index: number }) => (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: new Animated.Value(1),
        },
      ]}
    >
      <FeedCard
        {...item}
        onToggleLike={() => handleToggleLike(item.id)}
        index={index}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <FeedHeader />

      {/* Feed */}
      <View style={styles.feedContainer}>
        <FlatList
          data={feedItems}
          renderItem={renderFeedCard}
          keyExtractor={(item) => item.id}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          snapToInterval={isMobile ? height * 0.7 : undefined}
          snapToAlignment={isMobile ? 'start' : undefined}
          decelerationRate={isMobile ? 0.99 : 'normal'}
          removeClippedSubviews={false}
          maxToRenderPerBatch={3}
          initialNumToRender={3}
          updateCellsBatchingPeriod={50}
        />
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  feedContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  feedContent: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  cardWrapper: {
    marginBottom: 12,
    marginHorizontal: 0,
  },
});
