import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

type Props = {
  post: any;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function PostCard({
  post,
  onLike,
  onDelete,
}: Props) {
  return (
    <View style={styles.card}>
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
          <Text style={styles.name}>
            {post.userId?.displayName ||
              'Usuario'}
          </Text>

          <Text style={styles.username}>
            @{post.userId?.username || 'user'}
          </Text>
        </View>
      </View>

      {!!post.text && (
        <Text style={styles.text}>
          {post.text}
        </Text>
      )}

      {!!post.imageUrl && (
        <Image
          source={{
            uri: post.imageUrl,
          }}
          style={styles.postImage}
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onLike(post._id)}
        >
          <Text style={styles.action}>
            ❤️ {post.likesCount}
          </Text>
        </TouchableOpacity>

        <Text style={styles.action}>
          💬 {post.commentsCount}
        </Text>

        <TouchableOpacity
          onPress={() =>
            onDelete(post._id)
          }
        >
          <Text style={styles.delete}>
            🗑️
          </Text>
        </TouchableOpacity>
      </View>
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
    borderRadius: 14,
    marginTop: 12,
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
});