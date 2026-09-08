import React, { useEffect, useState } from 'react';
import {
  View, Image, TouchableOpacity, StyleSheet,
  Dimensions, Text, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../components/atoms/AppText';
import { getParameter } from '../api/parameters';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.52;
const BG = '#F5A623';

type Props = { onGetStarted?: (outlet: string) => void };

export default function WelcomeTemplate({ onGetStarted }: Props) {
  const [outlets, setOutlets] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingOutlets, setLoadingOutlets] = useState(false);

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
          <AppText style={styles.title}>Selamat Datang{'\n'}di Outlet App</AppText>
          <AppText style={styles.subtitle}>
            Pilih outlet Anda untuk mulai mengelola order dan memantau stok barang.
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

          {/* Dots */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.btn, !selected && styles.btnDisabled]}
            onPress={() => selected && onGetStarted?.(selected)}
            activeOpacity={0.85}
            disabled={!selected}
          >
            <Text style={styles.btnText}>Mulai</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

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

  title: {
    fontSize: 26, fontWeight: '800', color: '#1A1A1A',
    textAlign: 'center', lineHeight: 34, marginBottom: 14,
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

  dots: {
    flexDirection: 'row', gap: 6, marginTop: 20, marginBottom: 'auto' as any,
  },
  dot: { height: 8, borderRadius: 4 },
  dotInactive: { width: 8, backgroundColor: '#E0E0E0' },
  dotActive: { width: 24, backgroundColor: BG },

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
