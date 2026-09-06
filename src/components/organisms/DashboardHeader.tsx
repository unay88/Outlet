import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export default function DashboardHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.dotsGrid}>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotYellow]} />
          <View style={styles.dot} />
        </View>
      </View>
      <View style={styles.bellWrap}>
        <View style={styles.bellBody}>
          <View style={styles.bellTop} />
          <View style={styles.bellBottom} />
        </View>
        <View style={styles.badge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dotsGrid: { gap: 5 },
  dotsRow: { flexDirection: 'row', gap: 5 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.dark,
  },
  dotYellow: { backgroundColor: colors.primary },
  bellWrap: { position: 'relative', width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  bellBody: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBottom: {
    position: 'absolute',
    bottom: -5,
    width: 8,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.dark,
  },
  bellTop: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
