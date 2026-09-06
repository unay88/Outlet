import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, TouchableOpacity,
  Alert, StyleSheet, Text,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import FloatingLabelInput from '../components/atoms/FloatingLabelInput';
import LoadingOverlay from '../components/atoms/LoadingOverlay';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getProducts, Product } from '../api/products';
import { updateRequest, Request } from '../api/requests';
import { colors } from '../theme';

type OrderItem = { product_id: string; qty_req: string };

type Props = {
  item: Request;
  onBack?: () => void;
  onSuccess?: () => void;
};

export default function EditOrderScreen({ item, onBack, onSuccess }: Props) {
  const [reqBy, setReqBy] = useState(item.req_by ?? '');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [items, setItems] = useState<OrderItem[]>(
    item.items.map(i => ({ product_id: i.product_id, qty_req: String(i.qty_req ?? '') }))
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  function addItem() {
    setItems(prev => [...prev, { product_id: '', qty_req: '' }]);
    setExpandedRow(items.length);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
    if (expandedRow === idx) setExpandedRow(null);
  }

  function updateItem(idx: number, field: keyof OrderItem, value: string) {
    setItems(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  async function handleSubmit() {
    const invalid = items.find(i => !i.product_id || !i.qty_req.trim());
    if (items.length === 0 || invalid) {
      Alert.alert('Validasi', 'Semua item harus memiliki produk dan jumlah.');
      return;
    }
    try {
      setLoading(true);
      await updateRequest(item.id, {
        req_by: reqBy.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map(i => ({ product_id: i.product_id, qty_req: parseFloat(i.qty_req) })),
      });
      (onSuccess ?? onBack)?.();
    } catch (e: any) {
      Alert.alert('Gagal Menyimpan', e.message ?? 'Terjadi kesalahan, coba lagi.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Edit Order" onBack={onBack} />
      <LoadingOverlay visible={loading} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <FloatingLabelInput label="Diminta Oleh" placeholder="Nama pemohon (opsional)" value={reqBy} onChangeText={setReqBy} style={styles.input} />
        <FloatingLabelInput label="Catatan" placeholder="Tambahkan catatan... (opsional)" value={notes} onChangeText={setNotes} multiline style={styles.input} />

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <AppText style={styles.itemsTitle}>Produk yang Dipesan</AppText>
            <TouchableOpacity style={styles.addBtn} onPress={addItem} activeOpacity={0.8}>
              <Text style={styles.addBtnIcon}>+</Text>
              <AppText style={styles.addBtnText}>Tambah</AppText>
            </TouchableOpacity>
          </View>

          {items.length === 0 && (
            <AppText style={styles.emptyText}>Belum ada produk. Tap "+ Tambah" untuk menambahkan.</AppText>
          )}

          {items.map((orderItem, idx) => {
            const selectedProduct = products.find(p => p.id === orderItem.product_id);
            return (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <AppText style={styles.itemCardTitle}>Item #{idx + 1}</AppText>
                  <TouchableOpacity onPress={() => removeItem(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <AppText style={styles.pickerLabel}>Produk *</AppText>
                <TouchableOpacity
                  style={styles.pickerToggle}
                  onPress={() => setExpandedRow(expandedRow === idx ? null : idx)}
                  activeOpacity={0.8}
                >
                  <AppText style={orderItem.product_id ? styles.pickerValue : styles.pickerPlaceholder} numberOfLines={1}>
                    {selectedProduct ? (selectedProduct.name ?? selectedProduct.id) : (
                      item.items[idx]?.product_name ?? 'Pilih produk...'
                    )}
                  </AppText>
                  <Text style={styles.pickerChevron}>{expandedRow === idx ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedRow === idx && (
                  <View style={styles.pickerDropdown}>
                    {products.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.dropdownItem, orderItem.product_id === p.id && styles.dropdownItemActive]}
                        onPress={() => { updateItem(idx, 'product_id', p.id); setExpandedRow(null); }}
                        activeOpacity={0.8}
                      >
                        <AppText style={[styles.dropdownText, orderItem.product_id === p.id && styles.dropdownTextActive]}>
                          {p.name ?? p.id}
                        </AppText>
                        <AppText style={[styles.dropdownStock, orderItem.product_id === p.id && styles.dropdownStockActive]}>
                          Stok: {p.stock ?? 0}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <FloatingLabelInput
                  label="Jumlah"
                  placeholder="0"
                  value={orderItem.qty_req}
                  onChangeText={v => updateItem(idx, 'qty_req', v)}
                  keyboardType="numeric"
                  style={{ marginTop: 10 }}
                />
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
          <AppText style={styles.submitText}>Simpan Perubahan</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  input: { marginBottom: 14 },

  itemsSection: { marginTop: 4 },
  itemsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  itemsTitle: { fontSize: 13, fontWeight: '700', color: colors.dark, letterSpacing: 0.3 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnIcon: { fontSize: 16, color: colors.white, fontWeight: '700', lineHeight: 18 },
  addBtnText: { fontSize: 13, color: colors.white, fontWeight: '700' },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 16 },

  itemCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  itemCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  itemCardTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  removeIcon: { fontSize: 14, color: '#E74C3C', fontWeight: '700' },

  pickerLabel: { fontSize: 12, color: colors.muted, fontWeight: '500', marginBottom: 6 },
  pickerToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.subtle, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.background,
  },
  pickerValue: { fontSize: 14, color: colors.dark, flex: 1 },
  pickerPlaceholder: { fontSize: 14, color: colors.subtle, flex: 1 },
  pickerChevron: { fontSize: 10, color: colors.muted },
  pickerDropdown: {
    borderWidth: 1, borderColor: colors.subtle, borderRadius: 10,
    backgroundColor: colors.white, marginTop: 4, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownItemActive: { backgroundColor: colors.primary },
  dropdownText: { fontSize: 14, color: colors.dark, flex: 1 },
  dropdownTextActive: { color: colors.white, fontWeight: '700' },
  dropdownStock: { fontSize: 12, color: colors.muted },
  dropdownStockActive: { color: 'rgba(255,255,255,0.8)' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.background,
  },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
