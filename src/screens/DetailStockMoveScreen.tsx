import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
ScrollView, View, StyleSheet, Image,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import ScreenHeader from '../components/atoms/ScreenHeader';
import { StockMove, StockMoveProduct } from '../api/stockMoves';
import { colors } from '../theme';

const BG = colors.primary;


const ICON_IN  = require('../assets/icons/send-right-svgrepo-com.png');
const ICON_OUT = require('../assets/icons/send-left-svgrepo-com.png');

type Props =
  | { type: 'move'; item: StockMove; onBack?: () => void }
  | { type: 'moveProd'; item: StockMoveProduct; onBack?: () => void };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel}>{label}</AppText>
      <AppText style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</AppText>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function DetailStockMoveScreen(props: Props) {
  const { type, item, onBack } = props;

  const qtyChange = item.qty_change ?? 0;
  const moveTypeStr = type === 'move'
    ? ((item as StockMove).move_type ?? (item as StockMove).type ?? '')
    : ((item as StockMoveProduct).move_type ?? '');
  const isOut = moveTypeStr.toUpperCase() === 'OUT';
  const qtyColor = isOut ? '#E74C3C' : '#2ECC71';
  const dirIcon = isOut ? ICON_OUT : ICON_IN;
  const qtyStr = qtyChange > 0 ? `+${qtyChange}` : `${qtyChange}`;

  const moveType = moveTypeStr || '—';

  const productName = type === 'move'
    ? ((item as StockMove).product_name ?? (item as StockMove).product_id ?? '—')
    : ((item as StockMoveProduct).product_name ?? (item as StockMoveProduct).product_id ?? '—');

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Detail Stock Move" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { backgroundColor: isOut ? '#FFF5F5' : '#F0FFF4' }]}>
            <Image source={dirIcon} style={[styles.heroIcon, { tintColor: isOut ? '#E74C3C' : '#2ECC71' }]} resizeMode="contain" />
          </View>
          <AppText style={styles.heroProduct}>{productName}</AppText>

          {/* Qty change badge */}
          <View style={[styles.heroBadge, { backgroundColor: isOut ? '#FFF5F5' : '#F0FFF4' }]}>
            <Image source={dirIcon} style={[styles.heroDirIcon, { tintColor: qtyColor }]} resizeMode="contain" />
            <AppText style={[styles.heroBadgeText, { color: qtyColor }]}>{qtyStr}</AppText>
          </View>

          <AppText style={styles.heroDate}>{formatDate(item.created_at)}</AppText>
        </View>

        {/* Qty detail card */}
        <View style={styles.qtyCard}>
          <View style={styles.qtyItem}>
            <AppText style={styles.qtyItemLabel}>Sebelum</AppText>
            <AppText style={styles.qtyItemValue}>{item.qty_before ?? '—'}</AppText>
          </View>
          <View style={styles.qtyDivider} />
          <View style={styles.qtyItem}>
            <AppText style={styles.qtyItemLabel}>Perubahan</AppText>
            <AppText style={[styles.qtyItemValue, { color: qtyColor }]}>{qtyStr}</AppText>
          </View>
          <View style={styles.qtyDivider} />
          <View style={styles.qtyItem}>
            <AppText style={styles.qtyItemLabel}>Sesudah</AppText>
            <AppText style={styles.qtyItemValue}>{item.qty_after ?? '—'}</AppText>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <AppText style={styles.cardTitle}>INFORMASI</AppText>
          <Divider />

          <InfoRow label="Tipe Mutasi" value={moveType} />
          <Divider />

          {type === 'move' && (
            <>
              <InfoRow label="Tipe" value={(item as StockMove).type ?? '—'} />
              <Divider />
              <InfoRow label="Ref Type" value={(item as StockMove).ref_type ?? '—'} />
              <Divider />
              <InfoRow label="Supplier ID" value={(item as StockMove).sup_id ?? '—'} />
              <Divider />
            </>
          )}

          {type === 'moveProd' && (item as StockMoveProduct).raw_name && (
            <>
              <InfoRow label="Bahan Baku" value={(item as StockMoveProduct).raw_name!} />
              <Divider />
            </>
          )}

          {item.notes ? (
            <>
              <InfoRow label="Catatan" value={item.notes} />
              <Divider />
            </>
          ) : null}

          <InfoRow label="ID" value={item.id} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16 },

  heroCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  heroIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  heroIcon: { width: 32, height: 32, tintColor: BG },
  heroProduct: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 10,
  },
  heroDirIcon: { width: 14, height: 14 },
  heroBadgeText: { fontSize: 18, fontWeight: '800' },
  heroDate: { fontSize: 12, color: colors.muted, textAlign: 'center' },

  qtyCard: {
    backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row',
    marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  qtyItem: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  qtyItemLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  qtyItemValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  qtyDivider: { width: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },

  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 14, color: colors.muted, flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#F5F5F5' },
});
