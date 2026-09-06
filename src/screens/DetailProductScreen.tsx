import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Text, Image,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import FloatingLabelInput from '../components/atoms/FloatingLabelInput';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getProductById, deleteProduct, updateProductStock, Product } from '../api/products';
import { colors } from '../theme';

type Props = {
  productId: string;
  onBack?: () => void;
  onEdit?: (item: Product) => void;
  onDeleted?: () => void;
};

export default function DetailProductScreen({ productId, onBack, onEdit, onDeleted }: Props) {
  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stockInput, setStockInput] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => { fetchData(); }, [productId]);

  async function fetchData() {
    try {
      setLoading(true); setError(null);
      setItem(await getProductById(productId));
    } catch (e: any) { setError(e.message ?? 'Gagal memuat data'); }
    finally { setLoading(false); }
  }

  function confirmUpdateStock() {
    const qty = parseFloat(stockInput);
    if (!stockInput.trim() || isNaN(qty) || qty === 0) {
      Alert.alert('Validasi', 'Masukkan jumlah stok yang valid (boleh negatif untuk pengurangan).');
      return;
    }
    const label = qty > 0 ? `+${qty}` : `${qty}`;
    Alert.alert(
      'Konfirmasi Update Stok',
      `Stok "${item?.name ?? item?.code}" akan diubah ${label} dari ${item?.stock ?? 0} menjadi ${(item?.stock ?? 0) + qty}.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Update', onPress: handleUpdateStock },
      ],
    );
  }

  async function handleUpdateStock() {
    const qty = parseFloat(stockInput);
    try {
      setUpdatingStock(true);
      const updated = await updateProductStock(productId, qty);
      setItem(updated);
      setStockInput('');
    } catch (e: any) {
      Alert.alert('Gagal Update Stok', e.message ?? 'Terjadi kesalahan.');
    } finally { setUpdatingStock(false); }
  }

  function confirmDelete() {
    Alert.alert(
      'Hapus Produk',
      `Yakin ingin menghapus "${item?.name ?? item?.code}"? Semua detail produk juga akan terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: handleDelete },
      ],
    );
  }

  async function handleDelete() {
    if (!item) return;
    try {
      setDeleting(true);
      await deleteProduct(item.id);
      onDeleted?.();
    } catch (e: any) {
      Alert.alert('Gagal Menghapus', e.message ?? 'Terjadi kesalahan.');
    } finally { setDeleting(false); }
  }

  const fields: { label: string; value: string; mono?: boolean }[] = item ? [
    { label: 'Nama', value: item.name ?? '—' },
    { label: 'Kode', value: item.code ?? '—' },
    { label: 'Stok', value: item.stock != null ? String(item.stock) : '—' },
    { label: 'Min. Stok', value: item.min_stock != null ? String(item.min_stock) : '—' },
    { label: 'Outlet', value: item.outlet ?? '—' },
    { label: 'Harga Jual', value: item.sell_price != null ? `Rp ${Number(item.sell_price).toLocaleString('id-ID')}` : '—' },
    { label: 'Image URL', value: item.image ?? '—', mono: true },
    { label: 'ID', value: item.id, mono: true },
    { label: 'Dibuat', value: new Date(item.created_at).toLocaleString('id-ID') },
    { label: 'Diperbarui', value: new Date(item.modified_at).toLocaleString('id-ID') },
  ] : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Detail Produk" onBack={onBack} />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <AppText style={styles.stateText}>{error}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <AppText style={styles.retryText}>Coba Lagi</AppText>
          </TouchableOpacity>
        </View>
      ) : item ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Image */}
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
          ) : null}

          {/* Info utama */}
          <View style={styles.card}>
            {fields.map((f, idx) => (
              <View key={f.label}>
                <View style={styles.fieldRow}>
                  <AppText style={styles.fieldLabel}>{f.label}</AppText>
                  <AppText style={f.mono ? styles.fieldMono : styles.fieldValue}>{f.value}</AppText>
                </View>
                {idx < fields.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Update Stock */}
          <AppText style={styles.sectionLabel}>UPDATE STOK</AppText>
          <View style={styles.card}>
            <View style={styles.stockRow}>
              <FloatingLabelInput
                label="Tambah / Kurang Stok"
                placeholder="contoh: 10 atau -5"
                value={stockInput}
                onChangeText={setStockInput}
                keyboardType="numeric"
                style={styles.stockInput}
              />
              <TouchableOpacity
                style={[styles.stockBtn, updatingStock && styles.fabDisabled]}
                onPress={confirmUpdateStock}
                activeOpacity={0.85}
                disabled={updatingStock}
              >
                {updatingStock
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <AppText style={styles.stockBtnText}>Update</AppText>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Details / komposisi */}
          {item.details.length > 0 && (
            <>
              <AppText style={styles.sectionLabel}>KOMPOSISI BAHAN BAKU</AppText>
              <View style={styles.card}>
                {item.details.map((d, idx) => (
                  <View key={d.id}>
                    <View style={styles.fieldRow}>
                      <AppText style={styles.fieldLabel}>Bahan #{idx + 1}</AppText>
                      <View style={styles.detailRight}>
                        <AppText style={styles.fieldValue}>{d.raw_name ?? d.raw_id}</AppText>
                        <AppText style={styles.detailMeta}>
                          {d.unit ?? '—'}{d.conversion != null ? `  ×${d.conversion}` : ''}
                        </AppText>
                      </View>
                    </View>
                    {idx < item.details.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      ) : null}

      {item && (
        <View style={styles.fabGroup}>
          <TouchableOpacity style={[styles.fab, styles.fabDelete, deleting && styles.fabDisabled]} onPress={confirmDelete} activeOpacity={0.85} disabled={deleting}>
            {deleting ? <ActivityIndicator color={colors.white} size="small" /> : <Image source={require('../assets/Iconly/Curved/Vector (1) copy.png')} style={styles.fabIcon} resizeMode="contain" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={() => onEdit?.(item)} activeOpacity={0.85}>
            <Image source={require('../assets/Iconly/Curved/Vector copy.png')} style={styles.fabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  productImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16, backgroundColor: colors.subtle },
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: colors.muted,
    letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
  },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 14 },
  fieldLabel: { fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: '500' },
  fieldValue: { fontSize: 15, color: colors.dark, fontWeight: '600' },
  fieldMono: { fontSize: 12, color: colors.dark, fontFamily: 'monospace' },
  detailRight: { gap: 2 },
  detailMeta: { fontSize: 12, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.background, marginHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateIcon: { fontSize: 40 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  stockRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 16 },
  stockInput: { flex: 1 },
  stockBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  stockBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  fabGroup: { position: 'absolute', bottom: 28, right: 24, gap: 12 },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabDelete: { backgroundColor: '#E74C3C', shadowColor: '#E74C3C' },
  fabDisabled: { opacity: 0.6 },
  fabIcon: { width: 22, height: 22, tintColor: colors.white },
});
