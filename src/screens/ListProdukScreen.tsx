import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import { colors } from '../theme';

const CATEGORIES = [
  { id: '1', name: 'Beras &\nSerealia',    emoji: '🌾', bg: '#EDF7ED' },
  { id: '2', name: 'Minyak &\nLemak',      emoji: '🫙', bg: '#FEF3E2' },
  { id: '3', name: 'Daging &\nIkan',       emoji: '🥩', bg: '#FDECEA' },
  { id: '4', name: 'Roti &\nCamilan',      emoji: '🍞', bg: '#F3EEF8' },
  { id: '5', name: 'Susu &\nTelur',        emoji: '🥛', bg: '#FFFDE7' },
  { id: '6', name: 'Minuman',              emoji: '🧃', bg: '#E8F4FD' },
  { id: '7', name: 'Bumbu &\nRempah',      emoji: '🧄', bg: '#FFF0E6' },
  { id: '8', name: 'Sayur &\nBuah',        emoji: '🥦', bg: '#EDF7ED' },
];

type Props = { onBack?: () => void };

export default function ListProdukScreen({ onBack }: Props) {
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <AppText style={styles.title}>List Produk</AppText>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filtered.map(item => (
          <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: item.bg }]} activeOpacity={0.8}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <AppText style={styles.cardName}>{item.name}</AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  backBtn: { width: 32, alignItems: 'center' },
  backIcon: { fontSize: 32, color: colors.dark, lineHeight: 36, fontWeight: '300' },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.dark },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.dark, padding: 0 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '47%',
    borderRadius: 18,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 160,
  },
  emoji: { fontSize: 56, marginBottom: 12 },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
    lineHeight: 21,
  },
});
