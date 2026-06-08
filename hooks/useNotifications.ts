import { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Notifications: any = null;
let Device: any = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  if (__DEV__) {
    console.log('ℹ️ Notifications: Using demo mode (build production app for real notifications)');
  }
}

const NOTIFICATION_ENABLED_KEY = 'notifications_enabled';
const CHANNEL_ID = 'daily-puzzles';

// ─── Message pool ─────────────────────────────────────────────────────────────

function getDailyMessages(streak: number) {
  const streakLine =
    streak >= 7  ? `🔥 ${streak}-day streak — keep it alive!` :
    streak >= 3  ? `🔥 You're on a ${streak}-day streak!` :
    streak === 1 ? `⚡ You started a streak yesterday!` : null;

  const messages = [
    {
      title: '🧩 Daily Challenge is live!',
      body: streakLine ?? "Today's crostic puzzle is waiting. Can you crack it?",
    },
    {
      title: '🎯 Your daily puzzle is ready',
      body: streakLine ?? "A fresh crostic is here — test your word skills!",
    },
    {
      title: '💡 Brain workout time!',
      body: streakLine ?? "Solve today's crostic and keep your mind sharp.",
    },
    {
      title: '🌟 New daily puzzle!',
      body: streakLine ?? "Don't miss today's challenge — puzzles reset at midnight.",
    },
    {
      title: '🔥 Daily challenge awaits',
      body: streakLine ?? "Jump in and solve today's crostic before it's gone!",
    },
    {
      title: '📚 Word puzzle time',
      body: streakLine ?? "Sharpen your skills — today's crostic is ready.",
    },
  ];

  return messages;
}

// Times to send the daily reminder (local device time)
const REMINDER_TIMES = [
  { hour: 9,  minute: 0  },  // 9:00 AM
  { hour: 14, minute: 0  },  // 2:00 PM
  { hour: 19, minute: 0  },  // 7:00 PM
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(streak = 0) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const routerRef = useRef<any>(null);

  if (!Notifications || !Device) {
    return {
      expoPushToken: undefined,
      notificationsEnabled: false,
      permissionStatus: 'undetermined' as const,
      enableNotifications: async () => {
        Alert.alert('Development Mode', 'Notifications not available in dev mode. Build production app to test.');
        return false;
      },
      disableNotifications: async () => true,
      sendTestNotification: async () => {
        Alert.alert('Development Mode', 'Notifications not available in dev mode.');
      },
      cancelDailyReminders: async () => {},
      setRouter: (_r: any) => {},
    };
  }

  useEffect(() => {
    registerForPushNotifications();
    loadNotificationSettings();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('📬 Notification received:', notification.request.content.title);
    });

    // Navigate to daily screen when user taps the notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'daily' && routerRef.current) {
        routerRef.current.push('/(tabs)/daily');
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  function setRouter(router: any) {
    routerRef.current = router;
  }

  async function registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      setPermissionStatus(existingStatus);

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        setPermissionStatus(status);
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Push token:', token);
      setExpoPushToken(token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Daily Puzzle Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4C51A0',
          sound: 'default',
        });
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  }

  async function loadNotificationSettings() {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      const isEnabled = enabled === 'true';
      setNotificationsEnabled(isEnabled);
      if (isEnabled) {
        await scheduleDailyNotifications();
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  async function enableNotifications() {
    try {
      if (permissionStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status);
        if (status !== 'granted') return false;
      }

      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'true');
      setNotificationsEnabled(true);
      await scheduleDailyNotifications();
      return true;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }

  async function disableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false');
      setNotificationsEnabled(false);
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ All notifications cancelled');
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      return false;
    }
  }

  async function scheduleDailyNotifications() {
    if (!Notifications) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const messages = getDailyMessages(streak);

      for (const time of REMINDER_TIMES) {
        const message = messages[Math.floor(Math.random() * messages.length)];

        await Notifications.scheduleNotificationAsync({
          content: {
            title: message.title,
            body: message.body,
            sound: 'default',
            // Deep-link payload — tap opens the daily challenge screen
            data: { screen: 'daily', type: 'daily_reminder' },
            ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes?.DAILY ?? 'daily',
            hour: time.hour,
            minute: time.minute,
          },
        });
      }

      console.log(`✅ Daily notifications scheduled (streak: ${streak})`);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  /**
   * Call this when the user completes the daily challenge.
   * Cancels any remaining reminders for today so they don't get
   * nagged after they've already played.
   */
  async function cancelDailyReminders() {
    if (!Notifications) return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const now = new Date();

      for (const n of scheduled) {
        const data = n.content.data;
        if (data?.type !== 'daily_reminder') continue;

        // Cancel reminders whose trigger hour is still in the future today
        const triggerHour = n.trigger?.hour ?? 24;
        if (triggerHour > now.getHours()) {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
      console.log('✅ Remaining daily reminders cancelled after completion');
    } catch (error) {
      console.error('Error cancelling daily reminders:', error);
    }
  }

  async function sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎮 Notification test',
          body: "Your daily puzzle reminders are working!",
          sound: 'default',
          data: { screen: 'daily', type: 'test' },
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  return {
    expoPushToken,
    notificationsEnabled,
    permissionStatus,
    enableNotifications,
    disableNotifications,
    scheduleDailyNotifications,
    cancelDailyReminders,
    sendTestNotification,
    setRouter,
  };
}
