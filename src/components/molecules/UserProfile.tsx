import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

export default function UserProfile() {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
          style={styles.avatar}
        />
      </View>
      <View style={styles.info}>
        <AppText style={styles.greeting}>Hi 👋,</AppText>
        <AppText style={styles.name}>Mobina Sadat</AppText>
        <View style={styles.locationRow}>
          <Text style={styles.pin}>📍</Text>
          <AppText style={styles.location}>In Dubai Office</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  info: { flex: 1 },
  greeting: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  name: { fontSize: 20, fontWeight: 'bold', color: colors.dark, marginVertical: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pin: { fontSize: 13 },
  location: { fontSize: 13, color: colors.muted },
});
