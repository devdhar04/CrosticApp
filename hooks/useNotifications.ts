import { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Conditional imports - only load if native modules exist
let Notifications: any = null;
let Device: any = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  // Configure how notifications should be displayed when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  // Notifications module not available in Expo Go - this is expected
  if (__DEV__) {
    console.log('ℹ️ Notifications: Using demo mode (build production app for real notifications)');
  }
}

const NOTIFICATION_ENABLED_KEY = 'notifications_enabled';

// Daily notification messages (randomly selected)
const DAILY_MESSAGES = [
  {
    title: '🧩 Daily Puzzle Awaits!',
    body: 'Time to exercise your brain! Solve today\'s puzzle.',
  },
  {
    title: '🎯 Keep Your Streak Going!',
    body: 'Don\'t break your winning streak. Play now!',
  },
  {
    title: '💡 New Puzzle Available!',
    body: 'Challenge yourself with a fresh crostic puzzle.',
  },
  {
    title: '🌟 Puzzle Time!',
    body: 'Your daily dose of word puzzles is ready.',
  },
  {
    title: '🔥 Daily Challenge!',
    body: 'A new puzzle is waiting. Can you solve it?',
  },
  {
    title: '📚 Word Master!',
    body: 'Sharpen your skills with today\'s puzzle.',
  },
];

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // If modules not available, return mock implementation
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
    };
  }

  // Initialize notifications
  useEffect(() => {
    registerForPushNotifications();
    loadNotificationSettings();

    // Listen for notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    // Listen for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📬 Notification tapped:', response);
      // You can navigate to specific screen here if needed
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Register for push notifications
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
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get Expo push token (for push notifications from a server)
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Push token:', token);
      setExpoPushToken(token);

      // For Android, set notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-puzzles', {
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

  // Load notification settings from storage
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

  // Enable daily notifications
  async function enableNotifications() {
    try {
      // Request permission if not granted
      if (permissionStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status);

        if (status !== 'granted') {
          return false;
        }
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

  // Disable daily notifications
  async function disableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false');
      setNotificationsEnabled(false);
      await cancelAllNotifications();
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      return false;
    }
  }

  // Schedule daily notifications at specific times
  async function scheduleDailyNotifications() {
    try {
      // Cancel existing notifications first
      await cancelAllNotifications();

      // Schedule notifications for 9 AM, 2 PM, and 7 PM daily
      const scheduleTimes = [
        { hour: 9, minute: 0 },   // 9:00 AM
        { hour: 14, minute: 0 },  // 2:00 PM
        { hour: 19, minute: 0 },  // 7:00 PM
      ];

      for (const time of scheduleTimes) {
        const message = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

        await Notifications.scheduleNotificationAsync({
          content: {
            title: message.title,
            body: message.body,
            sound: 'default',
            data: { type: 'daily_reminder' },
          },
          trigger: {
            type: 'daily',
            hour: time.hour,
            minute: time.minute,
          },
        });
      }

      console.log('✅ Daily notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  // Cancel all scheduled notifications
  async function cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ All notifications canceled');
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  // Send a test notification immediately
  async function sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎮 Test Notification',
          body: 'Your notifications are working perfectly!',
          sound: 'default',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
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
    sendTestNotification,
  };
}
