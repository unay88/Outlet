import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

type DeepLinkData = { screen: string; req_id?: string };
type DeepLinkCallback = (data: DeepLinkData) => void;

async function displayNotification(title: string, body: string, data?: Record<string, string>) {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    title,
    body,
    data,
    android: { channelId, pressAction: { id: 'default' } },
  });
}

export async function getFcmToken(): Promise<string | undefined> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;
    if (!enabled) return undefined;
    return await getToken(messaging);
  } catch {
    return undefined;
  }
}

async function requestPermissionAndGetToken() {
  const token = await getFcmToken();
  if (token) console.log('FCM Token (Outlet):', token);
}

export default function useFCM(onDeepLink?: DeepLinkCallback) {
  useEffect(() => {
    requestPermissionAndGetToken();
    const messaging = getMessaging();

    // Foreground: tampilkan notif via notifee
    const unsubMessage = onMessage(messaging, async remoteMessage => {
      const data = remoteMessage.data as Record<string, string> | undefined;
      await displayNotification(
        remoteMessage.notification?.title ?? 'Notifikasi',
        remoteMessage.notification?.body ?? '',
        data,
      );
    });

    // Foreground notifee tap
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        const data = detail.notification.data as DeepLinkData;
        if (data.screen) onDeepLink?.(data);
      }
    });

    // Background tap
    const unsubOpened = onNotificationOpenedApp(messaging, remoteMessage => {
      const data = remoteMessage.data as DeepLinkData | undefined;
      if (data?.screen) onDeepLink?.(data);
    });

    // Killed state tap
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage?.data) {
        const data = remoteMessage.data as DeepLinkData;
        if (data.screen) onDeepLink?.(data);
      }
    });

    return () => {
      unsubMessage();
      unsubNotifee();
      unsubOpened();
    };
  }, []);
}
