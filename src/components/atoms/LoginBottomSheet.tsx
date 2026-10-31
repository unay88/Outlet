import React, { useRef, useEffect, useState } from 'react';
import {
  View, Modal, Animated, TouchableWithoutFeedback,
  StyleSheet, TouchableOpacity, KeyboardAvoidingView,
  ScrollView, Alert, Platform,
} from 'react-native';
import AppText from './AppText';
import FloatingLabelInput from './FloatingLabelInput';
import LoadingOverlay from './LoadingOverlay';
import { login, AuthUser } from '../../api/auth';
import { getFcmToken } from '../../hooks/useFCM';

const BG = '#F5A623';

type Props = {
  visible: boolean;
  outlet: string;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
};

export default function LoginBottomSheet({ visible, outlet, onClose, onSuccess }: Props) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  async function handleLogin() {
    if (!emailOrPhone.trim()) return Alert.alert('Validasi', 'Email / No. Telepon wajib diisi.');
    if (!pass.trim()) return Alert.alert('Validasi', 'Password wajib diisi.');
    try {
      setLoading(true);
      const fcmToken = await getFcmToken();
      const { user } = await login(emailOrPhone.trim(), pass.trim(), outlet, fcmToken);
      setEmailOrPhone('');
      setPass('');
      onSuccess(user);
    } catch (e: any) {
      Alert.alert('Login Gagal', e.message ?? 'Email/password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />
          <AppText style={styles.title}>Masuk ke Akun</AppText>
          <AppText style={styles.subtitle}>
            Outlet: <AppText style={styles.outletLabel}>{outlet}</AppText>
          </AppText>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <FloatingLabelInput
              label="Email / No. Telepon"
              placeholder="email@example.com atau 08xx..."
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <FloatingLabelInput
              label="Password"
              placeholder="Masukkan password"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <AppText style={styles.btnText}>Masuk</AppText>
            </TouchableOpacity>
            <View style={{ height: 16 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#9E9E9E', marginBottom: 24 },
  outletLabel: { fontSize: 13, fontWeight: '700', color: BG },
  input: { marginBottom: 16 },
  btn: {
    backgroundColor: BG, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: BG, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
