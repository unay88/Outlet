import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AppText from './AppText';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
        <Image source={require('../../assets/Iconly/Curved/Vector (2).png')} style={styles.backIcon} resizeMode="contain" />
      </TouchableOpacity>
      <AppText style={styles.title}>{title}</AppText>
      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 32 },
  backIcon: { width: 20, height: 20, tintColor: '#1A1A1A' },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  right: { width: 32, alignItems: 'flex-end' },
});
