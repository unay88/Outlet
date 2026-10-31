import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Image, Animated, Dimensions,
} from 'react-native';
import AppText from '../components/atoms/AppText';
import SideDrawer, { DRAWER_WIDTH } from '../components/atoms/SideDrawer';
import { AuthUser } from '../api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BG = '#F5A623';

const MENUS = [
  { icon: require('../assets/icons/shop-svgrepo-com.png'),          label: 'Produk',     screen: 'listProduct' },
  { icon: require('../assets/icons/shopping-cart-svgrepo-com.png'), label: 'List Order', screen: 'listOrder' },
  { icon: require('../assets/icons/send-svgrepo-com.png'),          label: 'Stock Move', screen: 'listStockMove' },
];

type Props = {
  onNavigate?: (screen: string) => void;
  user?: AuthUser | null;
  onLogout?: () => void;
};

export default function DashboardTemplate({ onNavigate, user, onLogout }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  function toggleDrawer() {
    const toValue = drawerOpen ? 0 : DRAWER_WIDTH;
    Animated.spring(slideAnim, { toValue, useNativeDriver: true, bounciness: 0, speed: 20 }).start();
    setDrawerOpen(prev => !prev);
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>

        {/* Drawer */}
        <View style={styles.drawerWrap}>
          <SideDrawer
            user={user ?? null}
            onLogout={() => { toggleDrawer(); onLogout?.(); }}
          />
        </View>

        {/* Main */}
        <View style={styles.main}>
          {drawerOpen && (
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={toggleDrawer} activeOpacity={1} />
          )}

          <View style={styles.headerBg}>
            <SafeAreaView edges={['top']}>
              <View style={styles.headerRow}>
                <TouchableOpacity style={styles.hamburgerWrap} onPress={toggleDrawer} activeOpacity={0.7}>
                  <View style={styles.hamburgerLine} />
                  <View style={[styles.hamburgerLine, { width: 16 }]} />
                  <View style={styles.hamburgerLine} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                  <AppText style={styles.headerGreeting}>Hai, {user?.name ?? 'Kamu'} 👋</AppText>
                  <AppText style={styles.headerTitle}>Outlet Hub</AppText>
                </View>
                <View style={styles.bellWrap}>
                  <Image source={require('../assets/icons/notification-svgrepo-com.png')} style={styles.bellImg} resizeMode="contain" />
                </View>
              </View>
            </SafeAreaView>

            {/* Info card */}
            <View style={styles.infoCard}>
              <AppText style={styles.infoEmoji}>🏪</AppText>
              <View style={styles.infoText}>
                <AppText style={styles.infoLabel}>Outlet Aktif</AppText>
                <AppText style={styles.infoValue}>{user?.outlet ?? '—'}</AppText>
              </View>
              <AppText style={styles.infoArrow}>›</AppText>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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

            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Stock Move</AppText>
              <TouchableOpacity onPress={() => onNavigate?.('listStockMove')}>
                <AppText style={styles.seeAll}>Lihat Semua →</AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.stockMoveCard} activeOpacity={0.85} onPress={() => onNavigate?.('listStockMove')}>
              <View style={styles.stockMoveRow}>
                <View style={styles.stockMoveIconWrap}>
                  <Image source={require('../assets/icons/send-svgrepo-com.png')} style={styles.stockMoveIconImg} resizeMode="contain" />
                </View>
                <View style={styles.stockMoveBody}>
                  <AppText style={styles.stockMoveTitle}>Riwayat Pergerakan Stok</AppText>
                  <AppText style={styles.stockMoveSub}>Lihat semua mutasi stok produk outlet</AppText>
                </View>
                <AppText style={styles.stockMoveArrow}>›</AppText>
              </View>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5', overflow: 'hidden' },
  container: { flexDirection: 'row', width: SCREEN_WIDTH + DRAWER_WIDTH, flex: 1, marginLeft: -DRAWER_WIDTH },
  drawerWrap: { width: DRAWER_WIDTH },
  main: { width: SCREEN_WIDTH, flex: 1 },

  headerBg: { backgroundColor: BG, paddingHorizontal: 20, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  hamburgerWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 8, gap: 4 },
  hamburgerLine: { width: 20, height: 2, backgroundColor: '#fff', borderRadius: 1 },
  headerCenter: { flex: 1 },
  headerGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  bellWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bellImg: { width: 20, height: 20, tintColor: '#fff' },

  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  infoEmoji: { fontSize: 36 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9E9E9E', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  infoArrow: { fontSize: 22, color: '#9E9E9E' },

  scroll: { flex: 1, marginTop: -16 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 0 },

  menuCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  menuItem: { width: '33.33%', alignItems: 'center', paddingVertical: 14 },
  menuIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF8EC', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  menuIconImg: { width: 26, height: 26, tintColor: BG },
  menuLabel: { fontSize: 12, color: '#2D2D2D', fontWeight: '500', textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  seeAll: { fontSize: 13, color: BG, fontWeight: '600' },

  stockMoveCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  stockMoveRow: { flexDirection: 'row', alignItems: 'center' },
  stockMoveIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF8EC', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stockMoveIconImg: { width: 24, height: 24, tintColor: BG },
  stockMoveBody: { flex: 1 },
  stockMoveTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  stockMoveSub: { fontSize: 12, color: '#9E9E9E' },
  stockMoveArrow: { fontSize: 22, color: '#CCCCCC', marginLeft: 8 },
});
