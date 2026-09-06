import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

const searchIcon = require('../../assets/Group (2).png');
const failureIcon = require('../../assets/Group (1).png');

type ActivityItemProps = {
  icon: any;
  iconSize: { width: number; height: number };
  title: string;
  subtitle: string;
  subtitleBold?: boolean;
  highlighted?: boolean;
};

function ActivityItem({ icon, iconSize, title, subtitle, subtitleBold, highlighted }: ActivityItemProps) {
  return (
    <TouchableOpacity
      style={[styles.item, highlighted ? styles.itemHighlighted : styles.itemDefault]}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Image source={icon} style={iconSize} resizeMode="contain" />
      </View>
      <View style={styles.textWrap}>
        <AppText style={[styles.title, highlighted && styles.titleLight]}>{title}</AppText>
        <AppText style={[styles.subtitle, highlighted && styles.subtitleLight, subtitleBold && styles.subtitleBold]}>
          {subtitle}
        </AppText>
      </View>
      <View style={[styles.arrowCircle, highlighted && styles.arrowCircleLight]}>
        <AppText style={[styles.arrow, highlighted && styles.arrowLight]}>›</AppText>
      </View>
    </TouchableOpacity>
  );
}

export default function RecentActivities() {
  return (
    <View>
      <AppText style={styles.sectionTitle}>Recent Activities</AppText>
      <View style={styles.list}>
        <ActivityItem
          icon={searchIcon}
          iconSize={{ width: 26, height: 38 }}
          title="You have checked"
          subtitle="12 packages"
          subtitleBold
          highlighted
        />
        <ActivityItem
          icon={failureIcon}
          iconSize={{ width: 24, height: 38 }}
          title="Failure to register"
          subtitle="the description"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 14,
  },
  list: { gap: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
  },
  itemHighlighted: { backgroundColor: colors.primary },
  itemDefault: { backgroundColor: '#F0F0F0' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.dark },
  titleLight: { color: colors.white },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  subtitleLight: { color: colors.white },
  subtitleBold: { fontWeight: '700' },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircleLight: { backgroundColor: 'rgba(255,255,255,0.4)' },
  arrow: { fontSize: 22, color: colors.muted, lineHeight: 24 },
  arrowLight: { color: colors.white },
});
