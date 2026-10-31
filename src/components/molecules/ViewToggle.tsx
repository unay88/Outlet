import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export type ViewMode = 'grid' | 'list';

type Props = {
  mode: ViewMode;
  onToggle: () => void;
};

export default function ViewToggle({ mode, onToggle }: Props) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onToggle} activeOpacity={0.8}>
      <Text style={styles.icon}>{mode === 'grid' ? '☰' : '⊞'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.subtle,
  },
  icon: { fontSize: 16, color: colors.muted },
});
