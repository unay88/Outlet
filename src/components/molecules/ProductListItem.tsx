import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

type Props = {
  name: string;
  description: string;
  time: string;
  highlighted?: boolean;
  onPress?: () => void;
};

export default function ProductListItem({ name, description, time, highlighted, onPress }: Props) {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, highlighted && styles.cardHighlighted]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailIcon}>📦</Text>
      </View>
      <View style={styles.content}>
        <AppText style={styles.name}>{name}</AppText>
        <AppText style={styles.description}>{description}</AppText>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, highlighted && styles.badgeHighlighted]}>
          <AppText style={[styles.badgeText, highlighted && styles.badgeTextHighlighted]}>
            {time}
          </AppText>
        </View>
        <TouchableOpacity onPress={() => setLiked(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.heart, liked && styles.heartActive]}>
            {liked ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: { fontSize: 24 },
  content: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    color: colors.muted,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 52,
  },
  badge: {
    backgroundColor: colors.dark,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeHighlighted: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  badgeTextHighlighted: {
    color: colors.white,
  },
  heart: {
    fontSize: 20,
    color: colors.muted,
  },
  heartActive: {
    color: colors.primary,
  },
});
