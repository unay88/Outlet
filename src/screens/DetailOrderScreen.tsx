import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useState } from 'react';
import {
ScrollView, View, TouchableOpacity, Modal,
  StyleSheet, Text, ActivityIndicator, RefreshControl, Image, TextInput,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import FloatingLabelInput from '../components/atoms/FloatingLabelInput';
import { getRequestById, deleteRequest, patchRequestStatus, Request } from '../api/requests';
import { colors } from '../theme';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending',  color: '#B7791F', bg: '#FEFCBF' },
  proses:  { label: 'Proses',   color: '#2B6CB0', bg: '#BEE3F8' },
  kirim:   { label: 'Kirim',   color: '#276749', bg: '#C6F6D5' },
  selesai: { label: 'Selesai', color: '#553C9A', bg: '#E9D8FD' },
  ditolak: { label: 'Ditolak', color: '#C53030', bg: '#FED7D7' },
};

const FINAL_STATUS = ['selesai', 'ditolak'];

function statusInfo(status: string | null) {
  const key = (status ?? '').toLowerCase();
  return STATUS_MAP[key] ?? { label: status ?? '—', color: colors.muted, bg: colors.background };
}

type ConfirmConfig = {
  icon: 'check' | string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  cancelLabel: string;
  onConfirm: () => void;
};

type Props = {
  requestId: string;
  onBack?: () => void;
  onEdit?: (item: Request) => void;
  onDeleted?: () => void;
  onSuccess?: (msg: string) => void;
};

export default function DetailOrderScreen({ requestId, onBack, onEdit, onDeleted, onSuccess }: Props) {
  const [data, setData] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qtyDelMap, setQtyDelMap] = useState<Record<string, string>>({});
  const [sudahSelesai, setSudahSelesai] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const result = await getRequestById(requestId);
      setData(result);
      const map: Record<string, string> = {};
      result.items.forEach(it => { map[it.id] = it.qty_del != null ? String(it.qty_del) : ''; });
      setQtyDelMap(map);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId]);

  useEffect(() => { fetchData(); }, []);

  function confirmDelete() {
    setConfirm({
      icon: '🗑️',
      title: 'Hapus Order?',
      message: `Order "${data?.code ?? data?.id.slice(0, 8).toUpperCase()}" akan dihapus permanen dan tidak bisa dikembalikan.`,
      confirmLabel: 'Hapus',
      confirmColor: '#E74C3C',
      cancelLabel: 'Batal',
      onConfirm: handleDelete,
    });
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteRequest(requestId);
      onDeleted?.();
    } catch (e: any) {
      setConfirm({
        icon: '⚠️',
        title: 'Gagal',
        message: (e as any).message ?? 'Gagal menghapus order',
        confirmLabel: 'OK',
        confirmColor: colors.primary,
        cancelLabel: '',
        onConfirm: () => {},
      });
    } finally { setDeleting(false); }
  }

  function confirmSelesai() {
    setConfirm({
      icon: 'check',
      title: 'Tandai Selesai?',
      message: 'Pastikan qty yang dikirim sudah diisi dengan benar. Order tidak bisa diubah setelah selesai.',
      confirmLabel: 'Tandai Selesai',
      confirmColor: '#276749',
      cancelLabel: 'Cek Lagi',
      onConfirm: handleSelesai,
    });
  }

  async function handleSelesai() {
    if (!data) return;
    try {
      setSubmitting(true);
      await patchRequestStatus(requestId, {
        status: 'selesai',
        items: data.items.map(it => ({
          id: it.id,
          qty_del: parseFloat(qtyDelMap[it.id] ?? '0') || 0,
        })),
      });
      setData(prev => prev ? {
        ...prev,
        status: 'selesai',
        items: prev.items.map(it => ({
          ...it,
          qty_del: parseFloat(qtyDelMap[it.id] ?? '0') || 0,
        })),
      } : prev);
      setSudahSelesai(true);
      onSuccess?.('Order berhasil ditandai selesai!');
    } catch (e: any) {
      setConfirm({
        icon: '⚠️',
        title: 'Gagal',
        message: (e as any).message ?? 'Gagal update status',
        confirmLabel: 'OK',
        confirmColor: colors.primary,
        cancelLabel: '',
        onConfirm: () => {},
      });
    } finally { setSubmitting(false); }
  }

  const st = statusInfo(data?.status ?? null);
  const isPending = (data?.status ?? '').toLowerCase() === 'pending';
  const isSelesai = (data?.status ?? '').toLowerCase() === 'selesai' || sudahSelesai;
  const isKirim = (data?.status ?? '').toLowerCase() === 'kirim' && !sudahSelesai;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Detail Order" onBack={onBack} />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <AppText style={styles.stateText}>{error}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <AppText style={styles.retryText}>Coba Lagi</AppText>
          </TouchableOpacity>
        </View>
      ) : !data ? null : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[colors.primary]} />}
        >
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
              <AppText style={[styles.statusText, { color: st.color }]}>{st.label}</AppText>
            </View>
            <AppText style={styles.heroCode}>{data.code ?? data.id.slice(0, 8).toUpperCase()}</AppText>
            <AppText style={styles.heroDate}>
              {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </AppText>
          </View>

          {/* Info */}
          <View style={styles.card}>
            <FieldRow label="Diminta Oleh" value={data.req_by ?? '—'} />
            <Divider />
            <FieldRow label="Diproses Oleh" value={data.pro_by ?? '—'} />
            {data.tot_amount != null && <><Divider /><FieldRow label="Total" value={`Rp ${Number(data.tot_amount).toLocaleString('id-ID')}`} /></>}
            {data.notes && <><Divider /><FieldRow label="Catatan" value={data.notes} /></>}
            {data.reject_reason && <><Divider /><FieldRow label="Alasan Ditolak" value={data.reject_reason} /></>}
            <Divider />
            <FieldRow label="ID" value={data.id} mono />
            <Divider />
            <FieldRow label="Dibuat" value={new Date(data.created_at).toLocaleString('id-ID')} />
            <Divider />
            <FieldRow label="Diperbarui" value={new Date(data.modified_at).toLocaleString('id-ID')} />
          </View>

          {/* Items */}
          <AppText style={styles.sectionLabel}>PRODUK YANG DIPESAN</AppText>
          <View style={styles.card}>
            {data.items.length === 0 ? (
              <AppText style={styles.emptyItems}>Tidak ada item</AppText>
            ) : data.items.map((it, idx) => (
              <View key={it.id}>
                <View style={styles.itemRow}>
                  <View style={styles.itemAvatar}>
                    <Text style={styles.itemAvatarText}>{(it.product_name?.[0] ?? '?').toUpperCase()}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <AppText style={styles.itemName}>{it.product_name ?? it.product_id}</AppText>

                    {/* Qty tracker row */}
                    <View style={styles.qtyTrack}>
                      <View style={styles.qtyTrackCol}>
                        <Image source={require('../assets/icons/up-svgrepo-com.png')} style={styles.qtyTrackIcon} resizeMode="contain" />
                        <AppText style={styles.qtyTrackLabel}>Diminta</AppText>
                        <AppText style={styles.qtyTrackVal}>{it.qty_req ?? '—'}</AppText>
                      </View>
                      <View style={styles.qtyTrackDivider} />
                      <View style={styles.qtyTrackCol}>
                        <Image source={require('../assets/icons/bag-ok-svgrepo-com.png')} style={[styles.qtyTrackIcon, { tintColor: '#2B6CB0' }]} resizeMode="contain" />
                        <AppText style={styles.qtyTrackLabel}>Disetujui</AppText>
                        <AppText style={[styles.qtyTrackVal, { color: it.qty_app != null ? '#2B6CB0' : colors.subtle }]}>
                          {it.qty_app ?? '—'}
                        </AppText>
                      </View>
                      <View style={styles.qtyTrackDivider} />
                      <View style={styles.qtyTrackCol}>
                        <Image source={require('../assets/icons/up-2-svgrepo-com.png')} style={[styles.qtyTrackIcon, { tintColor: '#553C9A' }]} resizeMode="contain" />
                        <AppText style={styles.qtyTrackLabel}>Diterima</AppText>
                        <AppText style={[styles.qtyTrackVal, { color: it.qty_del != null ? '#553C9A' : colors.subtle }]}>
                          {(isSelesai || !isKirim) && it.qty_del != null ? it.qty_del : '—'}
                        </AppText>
                      </View>
                    </View>

                    {/* qty_del input — hanya saat status kirim */}
                    {isKirim && (
                      <View style={styles.qtyDelRow}>
                        <AppText style={styles.qtyDelLabel}>Qty Dikirim</AppText>
                        <TextInput
                          style={styles.qtyDelInput}
                          value={qtyDelMap[it.id] ?? ''}
                          onChangeText={v => setQtyDelMap(prev => ({ ...prev, [it.id]: v }))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.subtle}
                        />
                      </View>
                    )}
                  </View>
                </View>
                {idx < data.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Selesai button — hanya saat status kirim */}
          {isKirim && (
            <TouchableOpacity
              style={[styles.selesaiBtn, submitting && styles.fabDisabled]}
              onPress={confirmSelesai}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color={colors.white} size="small" />
                : <View style={styles.selesaiBtnInner}>
                  <Image source={require('../assets/icons/bag-ok-svgrepo-com.png')} style={styles.selesaiBtnIcon} resizeMode="contain" />
                    <AppText style={styles.selesaiBtnText}>Tandai Selesai</AppText>
                  </View>}
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Confirmation Modal */}
      <Modal visible={!!confirm} transparent animationType="slide" onRequestClose={() => setConfirm(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setConfirm(null)}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalIconWrap}>
              {confirm?.icon === 'check'
                ? <Image source={require('../assets/icons/bag-ok-svgrepo-com.png')} style={styles.modalCheckIcon} resizeMode="contain" />
                : <Text style={styles.modalIconText}>{confirm?.icon}</Text>}
            </View>
            <AppText style={styles.modalTitle}>{confirm?.title}</AppText>
            <AppText style={styles.modalMessage}>{confirm?.message}</AppText>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, { backgroundColor: confirm?.confirmColor ?? colors.primary }]}
              onPress={() => { confirm?.onConfirm(); setConfirm(null); }}
              activeOpacity={0.85}
            >
              <AppText style={styles.modalConfirmText}>{confirm?.confirmLabel}</AppText>
            </TouchableOpacity>
            {!!confirm?.cancelLabel && (
              <TouchableOpacity onPress={() => setConfirm(null)} activeOpacity={0.7}>
                <AppText style={[styles.modalCancelText, { color: confirm?.confirmColor ?? colors.primary }]}>{confirm?.cancelLabel}</AppText>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* FAB edit + delete — hanya saat pending */}
      {data && isPending && (
        <View style={styles.fabGroup}>
          <TouchableOpacity
            style={[styles.fab, styles.fabDelete, deleting && styles.fabDisabled]}
            onPress={confirmDelete}
            activeOpacity={0.85}
            disabled={deleting}
          >
            {deleting
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Image source={require('../assets/icons/bin-svgrepo-com.png')} style={styles.fabIcon} resizeMode="contain" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={() => onEdit?.(data)} activeOpacity={0.85}>
            <Image source={require('../assets/icons/edit-3-svgrepo-com.png')} style={styles.fabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.fieldRow}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <AppText style={mono ? styles.fieldMono : styles.fieldValue}>{value}</AppText>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateIcon: { fontSize: 40 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  heroCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 8, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  statusText: { fontSize: 13, fontWeight: '700' },
  heroCode: { fontSize: 22, fontWeight: '800', color: colors.dark },
  heroDate: { fontSize: 13, color: colors.muted },

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
  divider: { height: 1, backgroundColor: colors.background, marginHorizontal: 16 },

  emptyItems: { fontSize: 13, color: colors.muted, textAlign: 'center', padding: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  itemAvatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center',
  },
  itemAvatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  itemInfo: { flex: 1, gap: 6 },
  itemName: { fontSize: 14, fontWeight: '700', color: colors.dark },

  qtyTrack: {
    flexDirection: 'row', backgroundColor: colors.background,
    borderRadius: 10, marginTop: 8, overflow: 'hidden',
  },
  qtyTrackCol: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4 },
  qtyTrackDivider: { width: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  qtyTrackIcon: { width: 14, height: 14, tintColor: colors.muted },
  qtyTrackLabel: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  qtyTrackVal: { fontSize: 15, fontWeight: '800', color: colors.dark },

  qtyDelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 6, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: colors.background,
  },
  qtyDelLabel: { fontSize: 12, color: colors.muted, fontWeight: '500', flex: 1 },
  qtyDelInput: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    fontSize: 14, fontWeight: '700', color: colors.dark,
    minWidth: 72, textAlign: 'center',
    backgroundColor: '#FFFBF5',
  },

  selesaiBtn: {
    backgroundColor: '#276749', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    shadowColor: '#276749', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  selesaiBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selesaiBtnIcon: { width: 18, height: 18, tintColor: colors.white },
  selesaiBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },

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

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 36, alignItems: 'center', gap: 8,
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  modalCheckIcon: { width: 32, height: 32, tintColor: '#276749' },
  modalIconText: { fontSize: 28 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  modalConfirmBtn: {
    width: '100%', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
  },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: colors.white },
  modalCancelText: { fontSize: 15, fontWeight: '600', marginTop: 12 },
});
