# Daily Notifications Setup Guide

## ✅ Implementation Complete!

Daily notifications are now fully implemented in the app. Users will receive reminders to play puzzles at:
- **9:00 AM** - Morning reminder
- **2:00 PM** - Afternoon reminder  
- **7:00 PM** - Evening reminder

---

## How It Works

### For Users:
1. Go to **Settings** tab
2. Toggle **"Daily Reminders"** ON
3. Grant notification permission when prompted
4. Receive test notification (optional)
5. Get daily reminders at scheduled times

### Notification Messages (Random):
- 🧩 Daily Puzzle Awaits! - Time to exercise your brain!
- 🎯 Keep Your Streak Going! - Don't break your winning streak
- 💡 New Puzzle Available! - Challenge yourself
- 🌟 Puzzle Time! - Your daily dose of word puzzles
- 🔥 Daily Challenge! - A new puzzle is waiting
- 📚 Word Master! - Sharpen your skills

---

## Technical Details

### Packages Used:
- `expo-notifications` - Handle notifications
- `expo-device` - Check if physical device (required for push)

### Android Configuration:
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```

### Notification Channel:
- **Name**: Daily Puzzle Reminders
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **Color**: #4C51A0 (app primary color)

### Storage:
- User preference stored in AsyncStorage
- Key: `notifications_enabled`
- Persists across app restarts

---

## Testing

### On Android Device:

1. **Build and Install:**
   ```bash
   cd artifacts/mobile
   eas build --platform android --profile development
   ```

2. **Enable Notifications:**
   - Open app
   - Go to Settings
   - Toggle "Daily Reminders" ON
   - Grant permission when prompted

3. **Send Test Notification:**
   - Tap "Send Test" button in the alert
   - Should receive immediate notification

4. **Wait for Scheduled Notification:**
   - Wait until 9 AM, 2 PM, or 7 PM
   - Should receive daily reminder

### Test Immediately (For Development):
You can modify the schedule times in `useNotifications.ts`:

```typescript
// Change to test in 1 minute
const scheduleTimes = [
  { hour: new Date().getHours(), minute: new Date().getMinutes() + 1 },
];
```

---

## Android 13+ Requirements

Android 13 (API 33) and above require **runtime permission** for notifications.

The app already handles this:
1. Requests permission when user enables notifications
2. Shows permission dialog
3. Handles "Allow" and "Deny" responses
4. Shows message if denied (user must enable in device settings)

---

## Notification Behavior

### When App is Closed:
- ✅ Notification appears in system tray
- ✅ Sound plays
- ✅ Vibration
- ✅ Tap to open app

### When App is Open:
- ✅ Notification banner appears at top
- ✅ Sound plays (if enabled)
- ✅ Can be dismissed

### When App is in Background:
- ✅ Notification appears in system tray
- ✅ Badge count increases (iOS)

---

## Customization Options

### Change Notification Times:
Edit `hooks/useNotifications.ts`:

```typescript
const scheduleTimes = [
  { hour: 8, minute: 0 },   // 8:00 AM
  { hour: 12, minute: 30 }, // 12:30 PM
  { hour: 20, minute: 0 },  // 8:00 PM
];
```

### Add More Messages:
Edit `DAILY_MESSAGES` array in `useNotifications.ts`:

```typescript
const DAILY_MESSAGES = [
  {
    title: '🎮 Your Custom Title',
    body: 'Your custom message here',
  },
  // ... more messages
];
```

### Change Notification Sound:
```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    // ...
    sound: 'custom_sound.wav', // Place in assets/sounds/
  },
});
```

### Change Vibration Pattern:
```typescript
vibrate: [0, 250, 250, 250], // [delay, vibrate, pause, vibrate, ...]
```

---

## Production Checklist

Before publishing to Play Store:

- [x] Permissions added to AndroidManifest.xml
- [x] Notification channel configured
- [x] User can enable/disable notifications
- [x] Notifications scheduled at appropriate times
- [x] Test notification works
- [x] Messages are engaging and varied
- [x] Handles permission denial gracefully
- [x] Persists user preference

---

## User Privacy

### What We Track:
- ✅ Whether notifications are enabled (local only)
- ❌ No personal data sent to servers
- ❌ No tracking of notification interactions
- ❌ No push token stored on backend

### Compliance:
- Notifications are **opt-in** (user must enable)
- Can be disabled anytime in Settings
- No data leaves the device
- Respects system notification preferences

---

## Troubleshooting

### Notifications Not Appearing:

1. **Check Permission:**
   - Settings → Apps → Crostic Puzzle → Notifications
   - Ensure enabled

2. **Check Do Not Disturb:**
   - System Do Not Disturb might block notifications
   - Check device settings

3. **Check Battery Optimization:**
   - Some devices kill background apps
   - Settings → Battery → App battery usage
   - Disable optimization for Crostic Puzzle

4. **Re-enable in App:**
   - Toggle notifications OFF then ON again
   - This re-schedules all notifications

### Test Notification Not Showing:
- Ensure app has notification permission
- Check if notifications are blocked in system settings
- Try closing and reopening app

### Scheduled Notifications Not Firing:
- Some Android manufacturers (Xiaomi, Huawei) aggressively kill background processes
- User may need to disable battery optimization for the app
- Consider using AlarmManager for more reliability (requires native code)

---

## Future Enhancements

### Possible Additions:

1. **Smart Timing:**
   - Learn user's most active times
   - Send notifications when user is most likely to play

2. **Streak Notifications:**
   - Remind users before streak expires (23 hours after last play)

3. **Achievement Notifications:**
   - "You unlocked a new achievement!"

4. **Puzzle Completion:**
   - "Only 1 puzzle left in this chapter!"

5. **Personalized Messages:**
   - Use user's name in notifications
   - Reference their progress

6. **Rich Notifications:**
   - Add action buttons ("Play Now", "Snooze")
   - Show puzzle preview image

---

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Android Notification Guide](https://developer.android.com/develop/ui/views/notifications)
- [iOS Notification Guide](https://developer.apple.com/documentation/usernotifications)

---

## Summary

✅ **Daily notifications fully implemented**  
✅ **3 reminders per day** (9 AM, 2 PM, 7 PM)  
✅ **6 different messages** (randomly selected)  
✅ **Opt-in system** (respects user choice)  
✅ **Test notification** (immediate feedback)  
✅ **Permission handling** (graceful degradation)  

Users can now be re-engaged daily to maintain their puzzle-solving habit! 🎉
