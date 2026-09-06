import React from 'react';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
  Text, SafeAreaView, StatusBar, Image,
} from 'react-native';
import AppText from '../components/atoms/AppText';

const BG = '#F5A623';

const MENUS = [
  { icon: require('../assets/Iconly/Curved/Vector (10).png'), label: 'Produk',     screen: 'listProduct' },
  { icon: require('../assets/Iconly/Curved/Vector (8).png'),  label: 'List Order', screen: 'listOrder' },
  { icon: require('../assets/Iconly/Curved/Vector copy 3.png'), label: 'Stock Move', screen: 'listStockMove' },
];

type Props = { onNavigate?: (screen: string) => void };

export default function DashboardTemplate({ onNavigate }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Red header bg */}
      <View style={styles.headerBg}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <Text style={styles.headerIcon}>🏪</Text>
            <AppText style={styles.headerTitle}>Outlet App</AppText>
            <View style={styles.bellWrap}>
              <Image source={require('../assets/Iconly/Curved/Vector.png')} style={styles.bellImg} resizeMode="contain" />
            </View>
          </View>
        </SafeAreaView>

        {/* Points card */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsEmoji}>📦</Text>
          <View style={styles.pointsText}>
            <AppText style={styles.pointsLabel}>Total Produk</AppText>
            <AppText style={styles.pointsValue}>Outlet Management</AppText>
          </View>
          <Text style={styles.pointsArrow}>›</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu card */}
        <View style={styles.menuCard}>
          <View style={styles.menuGrid}>
            {MENUS.map(m => (
              <TouchableOpacity
                key={m.screen}
                style={styles.menuItem}
                onPress={() => onNavigate?.(m.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Image source={m.icon} style={styles.menuIconImg} resizeMode="contain" />
                </View>
                <AppText style={styles.menuLabel}>{m.label}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stock Move shortcut */}
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>Stock Move</AppText>
          <TouchableOpacity onPress={() => onNavigate?.('listStockMove')}>
            <AppText style={styles.seeAll}>Lihat Semua →</AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.stockMoveCard}
          activeOpacity={0.85}
          onPress={() => onNavigate?.('listStockMove')}
        >
          <View style={styles.stockMoveRow}>
            <View style={styles.stockMoveIconWrap}>
              <Image
                source={require('../assets/Iconly/Curved/Vector copy 3.png')}
                style={styles.stockMoveIconImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.stockMoveBody}>
              <AppText style={styles.stockMoveTitle}>Riwayat Pergerakan Stok</AppText>
              <AppText style={styles.stockMoveSub}>Lihat semua mutasi stok produk & bahan baku</AppText>
            </View>
            <Text style={styles.stockMoveArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },

  headerBg: {
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerIcon: { fontSize: 22, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center', marginRight: 30 },
  bellWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pointsEmoji: { fontSize: 36 },
  pointsText: { flex: 1 },
  pointsLabel: { fontSize: 12, color: '#9E9E9E', marginBottom: 4 },
  pointsValue: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  pointsArrow: { fontSize: 22, color: '#9E9E9E' },

  scroll: { flex: 1, marginTop: -16 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 0 },

  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFF8EC',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  bellImg: { width: 20, height: 20, tintColor: '#fff' },
  menuIconImg: { width: 26, height: 26, tintColor: BG },
  menuLabel: { fontSize: 12, color: '#2D2D2D', fontWeight: '500', textAlign: 'center' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  seeAll: { fontSize: 13, color: BG, fontWeight: '600' },

  stockMoveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stockMoveRow: { flexDirection: 'row', alignItems: 'center' },
  stockMoveIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  stockMoveIconImg: { width: 24, height: 24, tintColor: BG },
  stockMoveBody: { flex: 1 },
  stockMoveTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  stockMoveSub: { fontSize: 12, color: '#9E9E9E' },
  stockMoveArrow: { fontSize: 22, color: '#CCCCCC', marginLeft: 8 },
});
