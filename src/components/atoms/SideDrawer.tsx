import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppText from './AppText';
import { AuthUser } from '../../api/auth';

const BG = '#F5A623';
export const DRAWER_WIDTH = 280;

type Props = {
  user: AuthUser | null;
  onLogout: () => void;
};

export default function SideDrawer({ user, onLogout }: Props) {
  return (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <View style={styles.avatarWrap}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppText style={styles.avatarInitial}>
                {(user?.name ?? user?.email ?? '?')[0].toUpperCase()}
              </AppText>
            </View>
          )}
        </View>
        <AppText style={styles.userName} numberOfLines={1}>{user?.name ?? '—'}</AppText>
        <AppText style={styles.userEmail} numberOfLines={1}>{user?.email ?? user?.phone ?? '—'}</AppText>
        {user?.outlet && (
          <View style={styles.outletBadge}>
            <AppText style={styles.outletText}>🏪 {user.outlet}</AppText>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.menuWrap}>
        <TouchableOpacity style={styles.menuItem} onPress={onLogout} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}>
            <AppText style={styles.menuIcon}>🚪</AppText>
          </View>
          <AppText style={styles.menuLabel}>Keluar</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <AppText style={styles.footerText}>Outlet Hub v1.0</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: DRAWER_WIDTH, flex: 1, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 16,
  },
  drawerHeader: { backgroundColor: BG, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  avatarPlaceholder: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  outletBadge: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3,
  },
  outletText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  menuWrap: { flex: 1, paddingTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF8EC', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  footerText: { fontSize: 11, color: '#BBBBBB', textAlign: 'center' },
});
