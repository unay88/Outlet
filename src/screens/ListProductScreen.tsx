import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useMemo, useState } from 'react';
import {
ScrollView, View, TouchableOpacity,
  ActivityIndicator, StyleSheet, Text, Image, Dimensions, RefreshControl,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import SearchBar from '../components/atoms/SearchBar';
import ListControlBar, { SortOption } from '../components/organisms/ListControlBar';
import { getProductOutlets, ProductOutlet } from '../api/products';
import { colors } from '../theme';

const BG = colors.primary;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 12) / 2;

type SortKey = 'name' | 'sell_price' | 'stock';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: SortOption<SortKey>[] = [
  { key: 'name', label: 'Nama' },
  { key: 'sell_price', label: 'Harga' },
  { key: 'stock', label: 'Stok' },
];

type Props = {
  onBack?: () => void;
  onAdd?: () => void;
  onSelect?: (id: string) => void;
  onRekon?: () => void;
  outlet?: string;
};

export default function ListProductScreen({ onBack, onAdd, onSelect, onRekon, outlet }: Props) {
  const [items, setItems] = useState<ProductOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => { fetchData(); }, []);

  async function fetchData(isRefresh = false) {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      setItems(await getProductOutlets(outlet));
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = useMemo(() => {
    let result = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let va: any, vb: any;
      if (sortKey === 'name') { va = (a.name ?? '').toLowerCase(); vb = (b.name ?? '').toLowerCase(); }
      else if (sortKey === 'sell_price') { va = a.sell_price ?? 0; vb = b.sell_price ?? 0; }
      else { va = a.stock ?? 0; vb = b.stock ?? 0; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [items, search, sortKey, sortDir]);

  function ProductCard({ item }: { item: ProductOutlet }) {
    const lowStock = item.stock != null && item.min_stock != null && item.stock <= item.min_stock;

    if (viewMode === 'list') {
      return (
        <TouchableOpacity style={styles.listItem} onPress={() => onSelect?.(item.id)} activeOpacity={0.85}>
          {item.image
            ? <Image source={{ uri: item.image }} style={styles.listImage} resizeMode="cover" />
            : <View style={styles.listImagePlaceholder}><Text style={{ fontSize: 24 }}>📦</Text></View>}
          <View style={styles.listBody}>
            {item.outlet && <View style={styles.outletBadge}><AppText style={styles.outletText}>{item.outlet}</AppText></View>}
            <AppText style={styles.cardName} numberOfLines={1}>{item.name ?? '—'}</AppText>
            <AppText style={styles.cardPrice}>
              {item.sell_price != null ? `Rp ${Number(item.sell_price).toLocaleString('id-ID')}` : '—'}
            </AppText>
            <View style={styles.stockRow}>
              <View style={[styles.stockDot, { backgroundColor: lowStock ? '#E74C3C' : '#2ECC71' }]} />
              <AppText style={[styles.stockText, lowStock && styles.stockLow]}>Stok: {item.stock ?? 0}</AppText>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.card} onPress={() => onSelect?.(item.id)} activeOpacity={0.85}>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
          : <View style={styles.cardImagePlaceholder}><Text style={styles.cardImageIcon}>📦</Text></View>}
        <View style={styles.cardBody}>
          {item.outlet && <View style={styles.outletBadge}><AppText style={styles.outletText}>{item.outlet}</AppText></View>}
          <AppText style={styles.cardName} numberOfLines={2}>{item.name ?? '—'}</AppText>
          <AppText style={styles.cardPrice}>
            {item.sell_price != null ? `Rp ${Number(item.sell_price).toLocaleString('id-ID')}` : '—'}
          </AppText>
          <View style={styles.stockRow}>
            <View style={[styles.stockDot, { backgroundColor: lowStock ? '#E74C3C' : '#2ECC71' }]} />
            <AppText style={[styles.stockText, lowStock && styles.stockLow]}>Stok: {item.stock ?? 0}</AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const left = filtered.filter((_, i) => i % 2 === 0);
  const right = filtered.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Produk" onBack={onBack} />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Cari nama atau kode..." />

      {!loading && !error && (
        <ListControlBar
          total={filtered.length}
          totalLabel="produk"
          sortOptions={SORT_OPTIONS}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
          viewMode={viewMode}
          onToggleView={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
        />
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BG} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <AppText style={styles.stateText}>{error}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <AppText style={styles.retryText}>Coba Lagi</AppText>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Image source={require('../assets/Group 26780.png')} style={styles.emptyIllustration} resizeMode="contain" />
          <AppText style={styles.emptyTitle}>Belum Ada Produk</AppText>
          <AppText style={styles.emptySubtitle}>Kamu belum menambahkan produk apapun.</AppText>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.stateIcon}>🔍</Text>
          <AppText style={styles.stateText}>Produk tidak ditemukan.</AppText>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[BG]} tintColor={BG} />}
        >
          {viewMode === 'grid' ? (
            <View style={styles.grid}>
              <View style={styles.column}>{left.map(item => <ProductCard key={item.id} item={item} />)}</View>
              <View style={styles.column}>{right.map(item => <ProductCard key={item.id} item={item} />)}</View>
            </View>
          ) : (
            <View>{filtered.map(item => <ProductCard key={item.id} item={item} />)}</View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={onRekon} activeOpacity={0.85}>
        <AppText style={styles.fabText}>Rekon Stok</AppText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 16 },

  grid: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, gap: 12 },

  card: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardImage: { width: '100%', height: CARD_WIDTH * 0.75 },
  cardImagePlaceholder: {
    width: '100%', height: CARD_WIDTH * 0.75,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
  },
  cardImageIcon: { fontSize: 36 },
  cardBody: { padding: 10, gap: 4 },

  listItem: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 14,
    overflow: 'hidden', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  listImage: { width: 90, height: 90 },
  listImagePlaceholder: {
    width: 90, height: 90, backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  listBody: { flex: 1, padding: 12, gap: 4, justifyContent: 'center' },

  outletBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FFF0F0',
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 2,
  },
  outletText: { fontSize: 10, color: BG, fontWeight: '700' },

  cardName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', lineHeight: 18 },
  cardPrice: { fontSize: 13, fontWeight: '800', color: BG },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: 11, color: colors.muted },
  stockLow: { color: '#E74C3C', fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: 28, right: 24,
    backgroundColor: BG, borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 14,
    shadowColor: BG, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  emptyIllustration: { width: 220, height: 180, marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateIcon: { fontSize: 40 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
