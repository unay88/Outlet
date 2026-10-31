import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import AppText from '../atoms/AppText';
import SortChip, { SortDir } from '../molecules/SortChip';
import ViewToggle, { ViewMode } from '../molecules/ViewToggle';
import { colors } from '../../theme';

export type SortOption<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  total: number;
  totalLabel?: string;
  sortOptions: SortOption<T>[];
  sortKey: T;
  sortDir: SortDir;
  onSort: (key: T) => void;
  viewMode: ViewMode;
  onToggleView: () => void;
};

export default function ListControlBar<T extends string>({
  total, totalLabel = 'item',
  sortOptions, sortKey, sortDir, onSort,
  viewMode, onToggleView,
}: Props<T>) {
  return (
    <View style={styles.bar}>
      <AppText style={styles.total}>{total} {totalLabel}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        {sortOptions.map(opt => (
          <SortChip
            key={opt.key}
            label={opt.label}
            active={sortKey === opt.key}
            dir={sortDir}
            onPress={() => onSort(opt.key)}
          />
        ))}
      </ScrollView>
      <ViewToggle mode={viewMode} onToggle={onToggleView} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  total: { fontSize: 12, fontWeight: '700', color: colors.muted },
  sortRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
