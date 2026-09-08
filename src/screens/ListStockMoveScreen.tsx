import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, TouchableOpacity,
  ActivityIndicator, StyleSheet, Image, RefreshControl,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getStockMoveProducts, StockMoveProduct } from '../api/stockMoves';
import { colors } from '../theme';

const BG = colors.primary;

const ICON_HISTORY  = require('../assets/Iconly/Curved/Vector copy 3.png');
const ICON_ARROW_R  = require('../assets/Iconly/Curved/Vector (1).png');
const ICON_ARROW_UP = require('../assets/Iconly/Curved/Vector (1) copy 3.png');
const ICON_ARROW_DN = require('../assets/Iconly/Curved/Vector (3) copy.png');

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    hour: '2-digit', minute: '2-digit',
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

type Props = {
  onBack?: () => void;
  onSelectMoveProd?: (item: StockMoveProduct) => void;
  outlet?: string;
};

export default function ListStockMoveScreen({ onBack, onSelectMoveProd, outlet }: Props) {
  const [moveProds, setMoveProds] = useState<StockMoveProduct[]>([]);
  const [moveProdsPage, setMoveProdsPage] = useState(1);
  const [moveProdsHasMore, setMoveProdsHasMore] = useState(true);
  const [moveProdsLoading, setMoveProdsLoading] = useState(false);
  const [moveProdsRefreshing, setMoveProdsRefreshing] = useState(false);
  const [moveProdsError, setMoveProdsError] = useState<string | null>(null);

  useEffect(() => { loadMoveProds(1, true); }, [outlet]);

  async function loadMoveProds(page: number, reset = false) {
    if (moveProdsLoading) return;
    try {
      setMoveProdsLoading(true); setMoveProdsError(null);
      const res = await getStockMoveProducts(page, 10, outlet);
      setMoveProds(prev => reset || page === 1 ? res.data : [...prev, ...res.data]);
      setMoveProdsPage(page);
      setMoveProdsHasMore(res.hasMore);
    } catch (e: any) {
      setMoveProdsError(e.message ?? 'Gagal memuat data');
    } finally { setMoveProdsLoading(false); setMoveProdsRefreshing(false); }
  }

  function handleScroll(e: any) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (!nearBottom) return;
    if (moveProdsHasMore && !moveProdsLoading) loadMoveProds(moveProdsPage + 1);
  }

  function onRefresh() {
    setMoveProdsRefreshing(true); loadMoveProds(1, true);
  }

  // Determine direction icon based on qty_change or move_type
  function dirIcon(qtyChange: number | null, moveType: string | null) {
    const mt = (moveType ?? '').toLowerCase();
    const isUp = (qtyChange != null && qtyChange > 0) || mt.includes('in') || mt === 'add';
    return isUp ? ICON_ARROW_UP : ICON_ARROW_DN;
  }

  function renderMoveProdRow(item: StockMoveProduct) {
    const label = item.product_name ?? item.product_id ?? '—';
    const rawLabel = item.raw_name ?? item.raw_id;
    const qty = item.qty_change != null ? `${item.qty_change > 0 ? '+' : ''}${item.qty_change}` : '—';
    const qtyColor = (item.qty_change ?? 0) >= 0 ? '#2ECC71' : '#E74C3C';
    return (
      <TouchableOpacity key={item.id} style={styles.row} activeOpacity={0.7} onPress={() => onSelectMoveProd?.(item)}>
        <View style={styles.iconWrap}>
          <Image source={ICON_HISTORY} style={styles.iconImg} resizeMode="contain" />
        </View>

        <View style={styles.rowBody}>
          <View style={styles.rowTitleRow}>
            <AppText style={styles.rowTitle} numberOfLines={1}>{label}</AppText>
            {qty !== '—' && (
              <View style={[styles.qtyBadge, { backgroundColor: (item.qty_change ?? 0) >= 0 ? '#F0FFF4' : '#FFF5F5' }]}>
                <Image source={dirIcon(item.qty_change, item.move_type)} style={[styles.dirIcon, { tintColor: qtyColor }]} resizeMode="contain" />
                <AppText style={[styles.qtyText, { color: qtyColor }]}>{qty}</AppText>
              </View>
            )}
          </View>
          <AppText style={styles.rowSub} numberOfLines={1}>{`${rawLabel ? rawLabel + '  ·  ' : ''}${formatDate(item.created_at)}`}</AppText>
        </View>

        <Image source={ICON_ARROW_R} style={styles.arrowIcon} resizeMode="contain" />
      </TouchableOpacity>
    );
  }

  const isLoading = moveProdsLoading && moveProds.length === 0;
  const isRefreshing = moveProdsRefreshing;
  const error = moveProdsError;
  const loadingMore = moveProdsLoading && moveProds.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Stock Move" onBack={onBack} />

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={BG} /></View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.stateIcon}>⚠️</AppText>
          <AppText style={styles.stateText}>{error}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <AppText style={styles.retryText}>Coba Lagi</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={200}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[BG]} tintColor={BG} />}
        >
          {moveProds.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Image source={require('../assets/Group 26780.png')} style={styles.emptyIllustration} resizeMode="contain" />
              <AppText style={styles.emptyTitle}>Belum Ada Data</AppText>
              <AppText style={styles.emptySubtitle}>Riwayat pergerakan stok akan muncul di sini.</AppText>
            </View>
          ) : (
            <View style={styles.listCard}>
              {moveProds.map(renderMoveProdRow)}
            </View>
          )}

          {loadingMore && (
            <View style={styles.loadMoreWrap}><ActivityIndicator size="small" color={BG} /></View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  listCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  iconImg: { width: 20, height: 20, tintColor: BG },
  rowBody: { flex: 1 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  qtyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  dirIcon: { width: 10, height: 10 },
  qtyText: { fontSize: 12, fontWeight: '700' },
  rowSub: { fontSize: 12, color: colors.muted },
  arrowIcon: { width: 16, height: 16, tintColor: '#CCCCCC', marginLeft: 8 },

  loadMoreWrap: { alignItems: 'center', paddingVertical: 16 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  stateIcon: { fontSize: 32, color: colors.muted },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 32 },
  emptyIllustration: { width: 200, height: 160, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
