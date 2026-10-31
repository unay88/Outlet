import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
ScrollView, View, TouchableOpacity,
  Alert, StyleSheet, Text,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import FloatingLabelInput from '../components/atoms/FloatingLabelInput';
import LoadingOverlay from '../components/atoms/LoadingOverlay';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { createProduct } from '../api/products';
import { getRawMaterials, RawMaterial } from '../api/rawMaterials';
import { getParameter } from '../api/parameters';
import { colors } from '../theme';

type DetailRow = { raw_id: string; unit: string; conversion: string };

type Props = { onBack?: () => void; onSuccess?: () => void };

export default function FormProductScreen({ onBack, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [outlet, setOutlet] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [image, setImage] = useState('');
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [outlets, setOutlets] = useState<string[]>([]);
  const [expandedOutlet, setExpandedOutlet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedRaw, setExpandedRaw] = useState<number | null>(null);

  useEffect(() => {
    getRawMaterials().then(setRawMaterials).catch(() => {});
    getParameter('outlet').then(setOutlets).catch(() => {});
  }, []);

  function addDetail() {
    setDetails(prev => [...prev, { raw_id: '', unit: '', conversion: '' }]);
    setExpandedRaw(details.length);
  }

  function removeDetail(idx: number) {
    setDetails(prev => prev.filter((_, i) => i !== idx));
    if (expandedRaw === idx) setExpandedRaw(null);
  }

  function updateDetail(idx: number, field: keyof DetailRow, value: string) {
    setDetails(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  async function handleSubmit() {
    const invalidDetail = details.find(d => !d.raw_id);
    if (invalidDetail) {
      Alert.alert('Validasi', 'Semua baris bahan baku harus dipilih.');
      return;
    }
    try {
      setLoading(true);
      await createProduct({
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(code.trim() ? { code: code.trim() } : {}),
        ...(stock.trim() ? { stock: parseFloat(stock) } : {}),
        ...(minStock.trim() ? { min_stock: parseFloat(minStock) } : {}),
        ...(outlet.trim() ? { outlet: outlet.trim() } : {}),
        ...(sellPrice.trim() ? { sell_price: parseFloat(sellPrice) } : {}),
        ...(image.trim() ? { image: image.trim() } : {}),
        details: details.map(d => ({
          raw_id: d.raw_id,
          unit: rawMaterials.find(r => r.id === d.raw_id)?.unit ?? undefined,
          ...(d.conversion.trim() ? { conversion: parseInt(d.conversion, 10) } : {}),
        })),
      });
      (onSuccess ?? onBack)?.();
    } catch (e: any) {
      Alert.alert('Gagal Menyimpan', e.message ?? 'Terjadi kesalahan, coba lagi.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Tambah Produk" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <FloatingLabelInput label="Nama Produk" placeholder="Nama produk" value={name} onChangeText={setName} style={styles.input} />
        <FloatingLabelInput label="Kode" placeholder="Kode produk" value={code} onChangeText={setCode} style={styles.input} />
        <FloatingLabelInput label="Stok" placeholder="0" value={stock} onChangeText={setStock} keyboardType="numeric" style={styles.input} />
        <FloatingLabelInput label="Min. Stok" placeholder="0" value={minStock} onChangeText={setMinStock} keyboardType="numeric" style={styles.input} />
        <AppText style={[styles.pickerLabel, { marginBottom: 6, marginTop: 2 }]}>Outlet</AppText>
        <TouchableOpacity
          style={[styles.pickerToggle, styles.input]}
          onPress={() => setExpandedOutlet(!expandedOutlet)}
          activeOpacity={0.8}
        >
          <AppText style={outlet ? styles.pickerToggleValue : styles.pickerTogglePlaceholder}>
            {outlet || 'Pilih outlet...'}
          </AppText>
          <Text style={styles.pickerChevron}>{expandedOutlet ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {expandedOutlet && (
          <View style={[styles.pickerDropdown, { marginBottom: 14 }]}>
            {outlets.map(o => (
              <TouchableOpacity
                key={o}
                style={[styles.dropdownItem, outlet === o && styles.dropdownItemActive]}
                onPress={() => { setOutlet(o); setExpandedOutlet(false); }}
                activeOpacity={0.8}
              >
                <AppText style={[styles.dropdownText, outlet === o && styles.dropdownTextActive]}>{o}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <FloatingLabelInput label="Harga Jual" placeholder="0" value={sellPrice} onChangeText={setSellPrice} keyboardType="numeric" style={styles.input} />
        <FloatingLabelInput label="URL Gambar" placeholder="https://..." value={image} onChangeText={setImage} style={styles.input} autoCapitalize="none" />

        {/* Detail rows */}
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <AppText style={styles.detailTitle}>Komposisi Bahan Baku</AppText>
            <TouchableOpacity style={styles.addDetailBtn} onPress={addDetail} activeOpacity={0.8}>
              <Text style={styles.addDetailIcon}>+</Text>
              <AppText style={styles.addDetailText}>Tambah</AppText>
            </TouchableOpacity>
          </View>

          {details.length === 0 && (
            <AppText style={styles.detailEmpty}>Belum ada bahan baku. Tap "+ Tambah" untuk menambahkan.</AppText>
          )}

          {details.map((d, idx) => (
            <View key={idx} style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <AppText style={styles.detailCardTitle}>Bahan #{idx + 1}</AppText>
                <TouchableOpacity onPress={() => removeDetail(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Raw material picker */}
              <AppText style={styles.pickerLabel}>Bahan Baku *</AppText>
              <TouchableOpacity
                style={styles.pickerToggle}
                onPress={() => setExpandedRaw(expandedRaw === idx ? null : idx)}
                activeOpacity={0.8}
              >
                <AppText style={d.raw_id ? styles.pickerToggleValue : styles.pickerTogglePlaceholder}>
                  {d.raw_id
                    ? (rawMaterials.find(r => r.id === d.raw_id)?.name ?? d.raw_id)
                    : 'Pilih bahan baku...'}
                </AppText>
                <Text style={styles.pickerChevron}>{expandedRaw === idx ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expandedRaw === idx && (
                <View style={styles.pickerDropdown}>
                  {rawMaterials.map(r => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.dropdownItem, d.raw_id === r.id && styles.dropdownItemActive]}
                      onPress={() => { updateDetail(idx, 'raw_id', r.id); setExpandedRaw(null); }}
                      activeOpacity={0.8}
                    >
                      <AppText style={[styles.dropdownText, d.raw_id === r.id && styles.dropdownTextActive]}>
                        {r.name ?? r.code ?? r.id}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Unit - auto dari raw material */}
              <AppText style={[styles.pickerLabel, { marginTop: 10 }]}>Satuan</AppText>
              <View style={[styles.pickerToggle, { backgroundColor: colors.subtle }]}>
                <AppText style={styles.pickerToggleValue}>
                  {rawMaterials.find(r => r.id === d.raw_id)?.unit || '-'}
                </AppText>
              </View>

              <FloatingLabelInput
                label="Conversion"
                placeholder="1"
                value={d.conversion}
                onChangeText={v => updateDetail(idx, 'conversion', v)}
                keyboardType="numeric"
                style={{ marginTop: 10 }}
              />
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <LoadingOverlay visible={loading} />

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
          <AppText style={styles.submitText}>Simpan Produk</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  input: { marginBottom: 14 },

  detailSection: { marginTop: 4 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  detailTitle: { fontSize: 13, fontWeight: '700', color: colors.dark, letterSpacing: 0.3 },
  addDetailBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  addDetailIcon: { fontSize: 16, color: colors.white, fontWeight: '700', lineHeight: 18 },
  addDetailText: { fontSize: 13, color: colors.white, fontWeight: '700' },
  detailEmpty: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 16 },

  detailCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  detailCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  detailCardTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  removeIcon: { fontSize: 14, color: '#E74C3C', fontWeight: '700' },

  pickerLabel: { fontSize: 12, color: colors.muted, fontWeight: '500', marginBottom: 6 },
  pickerToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.subtle, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.background,
  },
  pickerToggleValue: { fontSize: 14, color: colors.dark, flex: 1 },
  pickerTogglePlaceholder: { fontSize: 14, color: colors.subtle, flex: 1 },
  pickerChevron: { fontSize: 10, color: colors.muted },
  pickerDropdown: {
    borderWidth: 1, borderColor: colors.subtle, borderRadius: 10,
    backgroundColor: colors.white, marginTop: 4, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 11 },
  dropdownItemActive: { backgroundColor: colors.primary },
  dropdownText: { fontSize: 14, color: colors.dark },
  dropdownTextActive: { color: colors.white, fontWeight: '700' },

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
