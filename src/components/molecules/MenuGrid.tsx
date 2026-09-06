import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

type MenuItem = {
  icon: string;
  label: string;
  sublabel?: string;
  screen?: string;
};

type MenuGridProps = {
  title: string;
  items: MenuItem[];
  onItemPress?: (item: MenuItem) => void;
};

function MenuIconItem({ item, onPress }: { item: MenuItem; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.circle}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <AppText style={styles.label}>{item.label}</AppText>
      {item.sublabel && <AppText style={styles.sublabel}>{item.sublabel}</AppText>}
    </TouchableOpacity>
  );
}

export default function MenuGrid({ title, items, onItemPress }: MenuGridProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      <View style={styles.grid}>
        {items.map((item, i) => (
          <MenuIconItem key={i} item={item} onPress={() => onItemPress?.(item)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 26 },
  label: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  sublabel: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },
});
