import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

export type SortDir = 'asc' | 'desc';

type Props = {
  label: string;
  active: boolean;
  dir: SortDir;
  onPress: () => void;
};

export default function SortChip({ label, active, dir, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText style={[styles.text, active && styles.textActive]}>
        {label}{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.subtle,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12, fontWeight: '600', color: colors.muted },
  textActive: { color: colors.white },
});
