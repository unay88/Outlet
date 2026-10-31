import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './index';

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  outlet: string | null;
  status: number | null;
  image: string | null;
  fcm_token: string | null;
};

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export async function login(
  emailOrPhone: string,
  pass: string,
  outlet: string,
  fcm_token?: string,
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailOrPhone, pass, outlet, fcm_token }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? 'Login gagal');

  const user: AuthUser = json.data;

  await AsyncStorage.setItem(TOKEN_KEY, json.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token: json.token, user };
}

export async function logout(userId: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/users/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
  } catch {
    // lanjut logout meski update fcm gagal
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
