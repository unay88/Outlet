import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, TouchableOpacity,
  ActivityIndicator, StyleSheet, Text, RefreshControl, Image,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { getRequests, Request } from '../api/requests';
import { colors } from '../theme';

const TABS = ['Semua', 'Pending', 'Proses', 'Kirim', 'Selesai', 'Ditolak'];
const TAB_STATUS: Record<number, string> = { 1: 'pending', 2: 'proses', 3: 'kirim', 4: 'selesai', 5: 'ditolak' };

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#B7791F', bg: '#FEFCBF' },
  proses:   { label: 'Proses',   color: '#2B6CB0', bg: '#BEE3F8' },
  kirim:    { label: 'Kirim',   color: '#276749', bg: '#C6F6D5' },
  selesai:  { label: 'Selesai', color: '#553C9A', bg: '#E9D8FD' },
  ditolak:  { label: 'Ditolak', color: '#C53030', bg: '#FED7D7' },
};

function statusInfo(status: string | null) {
  const key = (status ?? '').toLowerCase();
  return STATUS_MAP[key] ?? { label: status ?? '—', color: colors.muted, bg: colors.background };
}

function groupByDate(list: Request[]): { title: string; data: Request[] }[] {
  const map = new Map<string, Request[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  for (const r of list) {
    const d = new Date(r.created_at);
    const key = d.toDateString();
    const label = key === today ? 'HARI INI' : key === yesterday ? 'KEMARIN' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(r);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

type Props = {
  onBack?: () => void;
  onAddOrder?: () => void;
  onSelectOrder?: (item: Request) => void;
  outlet?: string;
};

export default function ListOrderScreen({ onBack, onAddOrder, onSelectOrder, outlet }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      setRequests(await getRequests(outlet));
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const filtered = activeTab === 0
    ? requests
    : requests.filter(r => (r.status ?? '').toLowerCase() === (TAB_STATUS[activeTab] ?? ''));

  const sections = groupByDate(filtered);
  const hasData = requests.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="List Order" onBack={onBack} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContainer}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)} activeOpacity={0.8}>
            <AppText style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
      ) : (
        <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[colors.primary]} />}
        >
          {sections.length === 0 ? (
            <View style={styles.center}>
              <Image source={require('../assets/Group 26780.png')} style={styles.emptyIllustration} resizeMode="contain" />
              <AppText style={styles.emptyTitle}>Belum Ada Order</AppText>
              <AppText style={styles.emptySubtitle}>Kamu belum memiliki order apapun.</AppText>
              <TouchableOpacity style={styles.emptyBtn} onPress={onAddOrder} activeOpacity={0.85}>
                <Text style={styles.emptyBtnText}>＋  Tambah Order</Text>
              </TouchableOpacity>
            </View>
          ) : sections.map(section => (
            <View key={section.title}>
              <AppText style={styles.sectionTitle}>{section.title}</AppText>
              <View style={styles.sectionBody}>
                {section.data.map((item, idx) => {
                  const st = statusInfo(item.status);
                  return (
                    <View key={item.id}>
                      <TouchableOpacity
                        style={styles.row}
                        activeOpacity={0.7}
                        onPress={() => onSelectOrder?.(item)}
                      >
                        <View style={styles.rowMain}>
                          <View style={styles.rowTop}>
                            <AppText style={styles.rowCode}>{item.code ?? item.id.slice(0, 8).toUpperCase()}</AppText>
                            <View style={[styles.badge, { backgroundColor: st.bg }]}>
                              <AppText style={[styles.badgeText, { color: st.color }]}>{st.label}</AppText>
                            </View>
                          </View>
                          <AppText style={styles.rowMeta}>
                            {item.req_by ? `Oleh: ${item.req_by}` : ''}
                            {item.req_by && item.tot_amount ? '  ·  ' : ''}
                            {item.tot_amount != null ? `Rp ${Number(item.tot_amount).toLocaleString('id-ID')}` : ''}
                          </AppText>
                          {item.notes ? <AppText style={styles.rowNotes} numberOfLines={1}>{item.notes}</AppText> : null}
                          {item.items.length > 0 && (
                            <View style={styles.qtyRow}>
                              {item.items.slice(0, 2).map(it => (
                                <View key={it.id} style={styles.qtyItem}>
                                  <AppText style={styles.qtyItemName} numberOfLines={1}>{it.product_name ?? it.product_id}</AppText>
                                  <View style={styles.qtyPills}>
                                    <View style={styles.qtyPill}><AppText style={styles.qtyPillText}>R:{it.qty_req ?? '—'}</AppText></View>
                                    {it.qty_app != null && <View style={[styles.qtyPill, styles.qtyPillApp]}><AppText style={[styles.qtyPillText, { color: '#276749' }]}>A:{it.qty_app}</AppText></View>}
                                    {it.qty_del != null && <View style={[styles.qtyPill, styles.qtyPillDel]}><AppText style={[styles.qtyPillText, { color: '#553C9A' }]}>D:{it.qty_del}</AppText></View>}
                                  </View>
                                </View>
                              ))}
                              {item.items.length > 2 && <AppText style={styles.qtyMore}>+{item.items.length - 2} lainnya</AppText>}
                            </View>
                          )}
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </TouchableOpacity>
                      {idx < section.data.length - 1 && <View style={styles.separator} />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          <View style={{ height: hasData ? 100 : 40 }} />
        </ScrollView>
        </View>
      )}

      {hasData && !loading && (
        <TouchableOpacity style={styles.fab} onPress={onAddOrder} activeOpacity={0.85}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabsScroll: { backgroundColor: colors.white, maxHeight: 60, flexShrink: 0 },
  tabsContainer: { paddingLeft: 16, paddingRight: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, color: colors.muted, fontWeight: '500' },
  tabTextActive: { color: colors.white, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80, paddingHorizontal: 32 },
  emptyIllustration: { width: 220, height: 180, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  emptyBtn: {
    backgroundColor: colors.primary, borderRadius: 32,
    paddingHorizontal: 32, paddingVertical: 14, marginTop: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  stateIcon: { fontSize: 32 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
  sectionBody: {
    backgroundColor: colors.white, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowMain: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rowCode: { fontSize: 15, fontWeight: '700', color: colors.dark },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  rowMeta: { fontSize: 12, color: colors.muted },
  rowNotes: { fontSize: 12, color: colors.muted, marginTop: 2, fontStyle: 'italic' },

  qtyRow: { marginTop: 6, gap: 4 },
  qtyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyItemName: { fontSize: 11, color: colors.dark, fontWeight: '600', flex: 1 },
  qtyPills: { flexDirection: 'row', gap: 4 },
  qtyPill: { backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  qtyPillApp: { backgroundColor: '#C6F6D5' },
  qtyPillDel: { backgroundColor: '#E9D8FD' },
  qtyPillText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  qtyMore: { fontSize: 10, color: colors.subtle, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.subtle, marginLeft: 8 },
  separator: { height: 1, backgroundColor: colors.background, marginHorizontal: 16 },

  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabIcon: { fontSize: 28, color: colors.white, lineHeight: 32, fontWeight: '300' },
});
