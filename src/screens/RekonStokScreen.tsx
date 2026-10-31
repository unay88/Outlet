import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getProductOutlets, bulkUpdateProductOutletStock, ProductOutlet } from '../api/products';
import { colors } from '../theme';

const BG = colors.primary;

type Row = ProductOutlet & { newStock: string; changed: boolean };

type Props = {
  onBack?: () => void;
  outlet?: string;
  onSuccess?: (msg: string) => void;
};

export default function RekonStokScreen({ onBack, outlet, onSuccess }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, [outlet]);

  async function fetchData(isRefresh = false) {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getProductOutlets(outlet);
      setRows(data.map(p => ({ ...p, newStock: String(p.stock ?? 0), changed: false })));
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleChange(id: string, val: string) {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const changed = val !== String(r.stock ?? 0);
      return { ...r, newStock: val, changed };
    }));
  }

  async function handleSubmit() {
    const changed = rows.filter(r => r.changed && r.newStock !== '' && !isNaN(Number(r.newStock)));
    if (changed.length === 0) return;
    try {
      setSubmitting(true);
      await bulkUpdateProductOutletStock(
        changed.map(r => ({ id: r.id, stock: Number(r.newStock), outlet: r.outlet ?? '' }))
      );
      onSuccess?.(`${changed.length} produk berhasil diperbarui`);
    } catch (e: any) {
      setError(e.message ?? 'Gagal update stok');
    } finally {
      setSubmitting(false);
    }
  }

  const hasChanges = rows.some(r => r.changed);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Rekon Stok" onBack={onBack} />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={BG} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <AppText style={styles.stateText}>{error}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <AppText style={styles.retryText}>Coba Lagi</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[BG]} tintColor={BG} />}
          >
            {/* Table header */}
            <View style={styles.tableHeader}>
              <AppText style={[styles.thText, { flex: 3 }]}>Produk</AppText>
              <AppText style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Stok</AppText>
              <AppText style={[styles.thText, { flex: 1.5, textAlign: 'center' }]}>Stok Baru</AppText>
            </View>

            <View style={styles.tableBody}>
              {rows.length === 0 ? (
                <AppText style={styles.emptyText}>Belum ada produk</AppText>
              ) : rows.map((row, idx) => (
                <View key={row.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt, row.changed && styles.tableRowChanged]}>
                  <View style={{ flex: 3 }}>
                    <AppText style={styles.rowName} numberOfLines={2}>{row.name ?? '—'}</AppText>
                    {row.code ? <AppText style={styles.rowCode}>{row.code}</AppText> : null}
                  </View>
                  <AppText style={[styles.rowStock, { flex: 1, textAlign: 'center' }]}>{row.stock ?? 0}</AppText>
                  <View style={{ flex: 1.5, alignItems: 'center' }}>
                    <TextInput
                      style={[styles.stockInput, row.changed && styles.stockInputChanged]}
                      value={row.newStock}
                      onChangeText={v => handleChange(row.id, v.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>
                </View>
              ))}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, (!hasChanges || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!hasChanges || submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <AppText style={styles.submitText}>
                    Update Semua{hasChanges ? ` (${rows.filter(r => r.changed).length})` : ''}
                  </AppText>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  stateIcon: { fontSize: 32 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  tableHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BG, paddingHorizontal: 16, paddingVertical: 10,
  },
  thText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  tableBody: { backgroundColor: '#fff' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  tableRowChanged: { backgroundColor: '#FFFBF0' },

  rowName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  rowCode: { fontSize: 11, color: colors.muted, marginTop: 2 },
  rowStock: { fontSize: 14, fontWeight: '700', color: colors.dark },

  stockInput: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 6,
    fontSize: 14, fontWeight: '700', color: colors.dark,
    textAlign: 'center', width: 64, backgroundColor: '#fff',
  },
  stockInputChanged: { borderColor: BG, backgroundColor: '#FFFBF0' },

  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', padding: 32 },

  footer: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  submitBtn: {
    backgroundColor: BG, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: BG, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
