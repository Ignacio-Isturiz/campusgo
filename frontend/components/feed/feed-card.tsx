import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface FeedCardProps {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  onToggleLike: () => void;
  index: number;
}

/**
 * FeedCard - Tarjeta individual del feed
 * Muestra publicación con avatar, imagen, caption y acciones
 * Diseño moderno con animaciones suaves
 */
export default function FeedCard({
  id,
  author,
  handle,
  avatar,
  imageUrl,
  caption,
  likes,
  comments,
  shares,
  isLiked,
  onToggleLike,
  index,
}: FeedCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [likeAnim] = useState(new Animated.Value(isLiked ? 1 : 0));

  const handleLikePress = () => {
    // Animar el like
    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: isLiked ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleLike();
  };

  const likeIconColor = likeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.muted, colors.accent],
  });

  const likeScale = likeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={[styles.card, { marginHorizontal: isMobile ? 0 : 16 }]}>
      {/* Header - Info del usuario */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
          />
          <View style={styles.userMeta}>
            <Text style={styles.authorName}>{author}</Text>
            <Text style={styles.authorHandle}>{handle}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Imagen principal */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        {/* Overlay sutil en la parte inferior */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Acciones principales - Likes, Comments, Shares */}
      <View style={styles.actionBar}>
        <Animated.View
          style={[
            styles.actionItem,
            {
              transform: [{ scale: likeScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePress}
            activeOpacity={0.7}
          >
            <Animated.Text
              style={[
                styles.actionIcon,
                {
                  color: likeIconColor,
                },
              ]}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? colors.accent : colors.secondary}
              />
            </Animated.Text>
            <Text style={styles.actionCount}>{formatCount(likes)}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={24} color={colors.secondary} />
          <Text style={styles.actionCount}>{formatCount(comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={24} color={colors.secondary} />
          <Text style={styles.actionCount}>{formatCount(shares)}</Text>
        </TouchableOpacity>

        {/* Espaciador */}
        <View style={{ flex: 1 }} />

        {/* Icono de guardar */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Caption y info de likes */}
      <View style={styles.captionSection}>
        <View style={styles.likesInfo}>
          <Text style={styles.likesCount}>
            <Text style={styles.likesBold}>{formatCount(likes)} </Text>
            {likes === 1 ? 'me gusta' : 'me gustan'}
          </Text>
        </View>

        <View style={styles.captionContainer}>
          <Text
            style={styles.authorHandle}
            numberOfLines={1}
          >
            {handle}{' '}
          </Text>
          <Text
            style={styles.caption}
            numberOfLines={2}
          >
            {caption}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewMoreComments}>Ver los {formatCount(comments)} comentarios</Text>
        </TouchableOpacity>
      </View>

      {/* Footer - Tiempo */}
      <View style={styles.footer}>
        <Text style={styles.timeAgo}>Hace 2 horas</Text>
      </View>
    </View>
  );
}

/**
 * Función auxiliar para formatear números grandes
 */
function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 0,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  authorHandle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },

  // Imagen
  imageContainer: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    aspectRatio: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Acciones
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionItem: {
    marginRight: -4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionCount: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },

  // Caption
  captionSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likesInfo: {
    marginBottom: 4,
  },
  likesCount: {
    fontSize: 12,
    color: colors.secondary,
  },
  likesBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  captionContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  caption: {
    fontSize: 12,
    color: colors.secondary,
    flex: 1,
  },
  viewMoreComments: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },

  // Footer
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeAgo: {
    fontSize: 11,
    color: colors.muted,
  },
});
