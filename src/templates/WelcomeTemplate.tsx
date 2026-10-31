import React, { useEffect, useState } from 'react';
import {
  View, Image, TouchableOpacity, StyleSheet,
  Dimensions, Text, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../components/atoms/AppText';
import LoginBottomSheet from '../components/atoms/LoginBottomSheet';
import { getParameter } from '../api/parameters';
import { AuthUser } from '../api/auth';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.52;
const BG = '#F5A623';

type Props = { onGetStarted?: (user: AuthUser) => void };

export default function WelcomeTemplate({ onGetStarted }: Props) {
  const [outlets, setOutlets] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setLoadingOutlets(true);
    getParameter('outlet')
      .then(setOutlets)
      .catch(() => setOutlets([]))
      .finally(() => setLoadingOutlets(false));
  }, []);

  return (
    <View style={styles.root}>
      {/* Top — image area */}
      <View style={styles.imageWrap}>
        <Image
          source={require('../assets/Illustration.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Bottom — white card */}
      <View style={styles.card}>
        <SafeAreaView style={styles.cardInner} edges={['bottom']}>
          <View style={styles.brandWrap}>
            <AppText style={styles.appName}>Outlet Hub</AppText>
            <AppText style={styles.slogan}>Your Store. Your Orders. In Control.</AppText>
          </View>

          <View style={styles.divider} />

          <AppText style={styles.title}>Kelola Outlet,{' '}<AppText style={[styles.title, { color: BG }]}>Lebih Efisien</AppText></AppText>
          <AppText style={styles.subtitle}>
            Pantau stok, kelola pesanan, dan lacak pergerakan barang outlet Anda dalam satu genggaman.
          </AppText>

          {/* Outlet Picker */}
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            {loadingOutlets ? (
              <ActivityIndicator size="small" color={BG} />
            ) : (
              <AppText style={selected ? styles.pickerValue : styles.pickerPlaceholder}>
                {selected ?? 'Pilih outlet...'}
              </AppText>
            )}
            <Text style={styles.pickerChevron}>▼</Text>
          </TouchableOpacity>

          {/* Button */}
          <TouchableOpacity
            style={[styles.btn, !selected && styles.btnDisabled]}
            onPress={() => selected && setShowLogin(true)}
            activeOpacity={0.85}
            disabled={!selected}
          >
            <Text style={styles.btnText}>Mulai</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {selected && (
        <LoginBottomSheet
          visible={showLogin}
          outlet={selected}
          onClose={() => setShowLogin(false)}
          onSuccess={user => { setShowLogin(false); onGetStarted?.(user); }}
        />
      )}

      {/* Outlet Bottom Sheet Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHandle} />
            <AppText style={styles.modalTitle}>Pilih Outlet</AppText>
            <FlatList
              data={outlets}
              keyExtractor={item => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selected === item && styles.modalItemActive]}
                  onPress={() => { setSelected(item); setModalVisible(false); }}
                  activeOpacity={0.8}
                >
                  <AppText style={[styles.modalItemText, selected === item && styles.modalItemTextActive]}>
                    {item}
                  </AppText>
                  {selected === item && <Text style={styles.modalItemCheck}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              ListEmptyComponent={
                <AppText style={styles.modalEmpty}>Tidak ada data outlet.</AppText>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  imageWrap: { width, height: IMG_HEIGHT, backgroundColor: BG },
  image: { width: '100%', height: '100%' },

  card: {
    flex: 1, backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24,
  },
  cardInner: {
    flex: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 16, alignItems: 'center',
  },

  brandWrap: { alignItems: 'center', marginBottom: 16 },
  appName: { fontSize: 28, fontWeight: '900', color: BG, letterSpacing: 0.5 },
  slogan: { fontSize: 12, color: '#AAAAAA', fontWeight: '500', marginTop: 4, letterSpacing: 0.3 },

  divider: { width: 40, height: 3, backgroundColor: BG, borderRadius: 2, marginBottom: 16, opacity: 0.3 },

  title: {
    fontSize: 24, fontWeight: '800', color: '#1A1A1A',
    textAlign: 'center', lineHeight: 32, marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: '#7A7A7A', textAlign: 'center', lineHeight: 22, paddingHorizontal: 4,
  },

  picker: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 20, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 14,
    backgroundColor: '#FAFAFA',
  },
  pickerValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  pickerPlaceholder: { fontSize: 15, color: '#BDBDBD', flex: 1 },
  pickerChevron: { fontSize: 11, color: '#9E9E9E', marginLeft: 8 },

  btn: {
    width: '100%', backgroundColor: BG, borderRadius: 32,
    paddingVertical: 18, alignItems: 'center', marginTop: 24,
    shadowColor: BG, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: 32, maxHeight: height * 0.55,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '800', color: '#1A1A1A',
    paddingHorizontal: 20, marginBottom: 8,
  },
  modalList: { paddingHorizontal: 12 },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 16, borderRadius: 12,
  },
  modalItemActive: { backgroundColor: '#FFF3E0' },
  modalItemText: { fontSize: 15, color: '#2D2D2D', fontWeight: '500' },
  modalItemTextActive: { color: BG, fontWeight: '700' },
  modalItemCheck: { fontSize: 16, color: BG, fontWeight: '700' },
  modalSeparator: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 12 },
  modalEmpty: { fontSize: 14, color: '#9E9E9E', textAlign: 'center', paddingVertical: 24 },
});
