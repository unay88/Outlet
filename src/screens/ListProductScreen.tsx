import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, TouchableOpacity,
  ActivityIndicator, StyleSheet, Text, Image, Dimensions, RefreshControl,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getProducts, Product } from '../api/products';
import { colors } from '../theme';

const BG = colors.primary;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 12) / 2;

type Props = {
  onBack?: () => void;
  onAdd?: () => void;
  onSelect?: (id: string) => void;
};

export default function ListProductScreen({ onBack, onAdd, onSelect }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData(isRefresh = false) {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      setItems(await getProducts());
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  function ProductCard({ item }: { item: Product }) {
    const lowStock = item.stock != null && item.min_stock != null && item.stock <= item.min_stock;
    return (
      <TouchableOpacity style={styles.card} onPress={() => onSelect?.(item.id)} activeOpacity={0.85}>
        {/* Image */}
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
          : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImageIcon}>📦</Text>
            </View>
          )}

        <View style={styles.cardBody}>
          {/* Outlet badge */}
          {item.outlet ? (
            <View style={styles.outletBadge}>
              <AppText style={styles.outletText}>{item.outlet}</AppText>
            </View>
          ) : null}

          {/* Name */}
          <AppText style={styles.cardName} numberOfLines={2}>{item.name ?? '—'}</AppText>

          {/* Price */}
          <AppText style={styles.cardPrice}>
            {item.sell_price != null
              ? `Rp ${Number(item.sell_price).toLocaleString('id-ID')}`
              : '—'}
          </AppText>

          {/* Stock */}
          <View style={styles.stockRow}>
            <View style={[styles.stockDot, { backgroundColor: lowStock ? '#E74C3C' : '#2ECC71' }]} />
            <AppText style={[styles.stockText, lowStock && styles.stockLow]}>
              Stok: {item.stock ?? 0}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Produk" onBack={onBack} />

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
          <Image
            source={require('../assets/Group 26780.png')}
            style={styles.emptyIllustration}
            resizeMode="contain"
          />
          <AppText style={styles.emptyTitle}>Belum Ada Produk</AppText>
          <AppText style={styles.emptySubtitle}>Kamu belum menambahkan produk apapun.</AppText>
          <TouchableOpacity style={styles.emptyBtn} onPress={onAdd} activeOpacity={0.85}>
            <Text style={styles.emptyBtnIcon}>＋</Text>
            <AppText style={styles.emptyBtnText}>Tambah Produk</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[BG]} tintColor={BG} />}
        >
          <View style={styles.grid}>
            {/* Left column */}
            <View style={styles.column}>
              {left.map(item => <ProductCard key={item.id} item={item} />)}
            </View>
            {/* Right column */}
            <View style={styles.column}>
              {right.map(item => <ProductCard key={item.id} item={item} />)}
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 16 },

  grid: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, gap: 12 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { width: '100%', height: CARD_WIDTH * 0.75 },
  cardImagePlaceholder: {
    width: '100%', height: CARD_WIDTH * 0.75,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  cardImageIcon: { fontSize: 36 },

  cardBody: { padding: 10, gap: 4 },

  outletBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 2,
  },
  outletText: { fontSize: 10, color: BG, fontWeight: '700' },

  cardName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', lineHeight: 18 },
  cardPrice: { fontSize: 13, fontWeight: '800', color: BG },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: 11, color: colors.muted },
  stockLow: { color: '#E74C3C', fontWeight: '600' },

  emptyIllustration: { width: 220, height: 180, marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22, marginBottom: 28 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: BG, borderRadius: 32,
    paddingHorizontal: 32, paddingVertical: 16,
    shadowColor: BG, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  emptyBtnIcon: { fontSize: 18, color: '#fff', fontWeight: '300' },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateIcon: { fontSize: 40 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
