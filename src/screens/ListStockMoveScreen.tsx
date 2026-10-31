import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
FlatList, View, TouchableOpacity,
  ActivityIndicator, StyleSheet, Image, TextInput, RefreshControl,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getStockMoveProductOutlets, StockMoveProductOutlet } from '../api/stockMoves';
import { colors } from '../theme';

const BG = colors.primary;
const ICON_ARROW_R = require('../assets/icons/right-svgrepo-com.png');
const ICON_UP      = require('../assets/icons/send-right-svgrepo-com.png');
const ICON_DN      = require('../assets/icons/send-left-svgrepo-com.png');

const MOVE_TYPES = ['Semua', 'IN', 'OUT'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    hour: '2-digit', minute: '2-digit',
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

type Props = {
  onBack?: () => void;
  onSelect?: (item: StockMoveProductOutlet) => void;
  outlet?: string;
};

export default function ListStockMoveScreen({ onBack, onSelect, outlet }: Props) {
  const [data, setData] = useState<StockMoveProductOutlet[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [moveType, setMoveType] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { load(1, true, search, moveType); }, [outlet]);

  function onSearchChange(text: string) {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(1, true, text, moveType), 400);
  }

  function onFilterChange(mt: string) {
    const val = mt === 'Semua' ? '' : mt;
    setMoveType(val);
    load(1, true, search, val);
  }

  async function load(p: number, reset = false, s = search, mt = moveType) {
    if (loading && !reset) return;
    try {
      setLoading(true); setError(null);
      const res = await getStockMoveProductOutlets(p, 10, outlet, mt || undefined);
      const filtered = s
        ? res.data.filter(i => (i.product_name ?? '').toLowerCase().includes(s.toLowerCase()))
        : res.data;
      setData(prev => reset || p === 1 ? filtered : [...prev, ...filtered]);
      setPage(p); setHasMore(res.hasMore);
    } catch (e: any) { setError(e.message ?? 'Gagal memuat data'); }
    finally { setLoading(false); setRefreshing(false); }
  }

  const renderItem = useCallback(({ item }: { item: StockMoveProductOutlet }) => {
    const isIn = (item.move_type ?? '').toUpperCase() === 'IN';
    const qty = item.qty_change != null ? `${isIn ? '+' : '-'}${item.qty_change}` : '—';
    const qtyColor = isIn ? '#2ECC71' : '#E74C3C';
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => onSelect?.(item)}>
        <View style={[styles.iconWrap, { backgroundColor: isIn ? '#F0FFF4' : '#FFF5F5' }]}>
          <Image source={isIn ? ICON_UP : ICON_DN} style={[styles.iconImg, { tintColor: qtyColor }]} resizeMode="contain" />
        </View>
        <View style={styles.rowBody}>
          <View style={styles.rowTitleRow}>
            <AppText style={styles.rowTitle} numberOfLines={1}>{item.product_name ?? '—'}</AppText>
            {item.qty_change != null && (
              <View style={[styles.qtyBadge, { backgroundColor: isIn ? '#F0FFF4' : '#FFF5F5' }]}>
                <Image source={isIn ? ICON_UP : ICON_DN} style={[styles.dirIcon, { tintColor: qtyColor }]} resizeMode="contain" />
                <AppText style={[styles.qtyText, { color: qtyColor }]}>{qty}</AppText>
              </View>
            )}
          </View>
          <AppText style={styles.rowSub}>{`${item.move_type ?? '—'}  ·  ${item.ref_type ?? '—'}  ·  ${formatDate(item.created_at)}`}</AppText>
        </View>
        <Image source={ICON_ARROW_R} style={styles.arrowIcon} resizeMode="contain" />
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Stock Move" onBack={onBack} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama produk..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      <View style={styles.filterRow}>
        {MOVE_TYPES.map(mt => (
          <TouchableOpacity
            key={mt}
            style={[styles.filterChip, (moveType === (mt === 'Semua' ? '' : mt)) && styles.filterChipActive]}
            onPress={() => onFilterChange(mt)}
            activeOpacity={0.8}
          >
            <AppText style={[styles.filterChipText, (moveType === (mt === 'Semua' ? '' : mt)) && styles.filterChipTextActive]}>{mt}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={() => { if (hasMore && !loading) load(page + 1); }}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1, true); }} colors={[BG]} tintColor={BG} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyWrap}>
            <Image source={require('../assets/Group 26780.png')} style={styles.emptyIllustration} resizeMode="contain" />
            <AppText style={styles.emptyTitle}>Belum Ada Data</AppText>
            <AppText style={styles.emptySubtitle}>Riwayat pergerakan stok outlet akan muncul di sini.</AppText>
          </View>
        ) : null}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={BG} style={{ margin: 16 }} /> : null}
      />
      {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  searchRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchInput: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: colors.dark },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F5F5F5' },
  filterChipActive: { backgroundColor: BG },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  filterChipTextActive: { color: '#fff' },

  list: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconImg: { width: 20, height: 20 },
  rowBody: { flex: 1 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  qtyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  dirIcon: { width: 10, height: 10 },
  qtyText: { fontSize: 12, fontWeight: '700' },
  rowSub: { fontSize: 11, color: colors.muted },
  arrowIcon: { width: 16, height: 16, tintColor: '#CCCCCC', marginLeft: 8 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 32 },
  emptyIllustration: { width: 200, height: 160, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  errorText: { textAlign: 'center', color: '#E74C3C', padding: 16 },
});
