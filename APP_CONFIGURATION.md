# App Configuration Summary

## Bundle Identifiers

### Android
```
Package Name: com.betterapps.crostic
```

### iOS
```
Bundle Identifier: com.betterapps.crostic
```

---

## App Information

**App Name:** Crostic Puzzle  
**Display Name:** CROSTIC  
**Publisher:** Better Apps  
**Category:** Game / Word Puzzle  

---

## Google Play Console Setup

When creating your app in Google Play Console, use these details:

### App Identity
- **Package name:** `com.betterapps.crostic`
- **App name:** Crostic Puzzle
- **Short description:** Word puzzle game with daily challenges
- **Full description:** Challenge yourself with engaging crostic puzzles! Decode quotes by solving word clues.

### In-App Products

Create these product IDs in Google Play Console:

#### Coin Packs (Consumable)
1. **Starter Pack**
   - Product ID: `coins_200_starter`
   - Name: 200 Coins - Starter Pack
   - Price: $0.99 USD

2. **Popular Pack**
   - Product ID: `coins_700_popular`
   - Name: 700 Coins - Popular Pack
   - Price: $2.99 USD

3. **Mega Pack**
   - Product ID: `coins_2000_mega`
   - Name: 2000 Coins - Mega Pack
   - Price: $7.99 USD

#### Premium Features (For Future Use)
4. **Remove Ads**
   - Product ID: `remove_ads_onetime`
   - Type: One-time purchase
   - Price: $3.99 USD

5. **Premium Subscription**
   - Product ID: `premium_weekly_subscription`
   - Type: Auto-renewable subscription
   - Price: $1.99 USD / week

---

## Build Commands

### Development Build
```bash
cd artifacts/mobile

# Using Expo Prebuild
npx expo prebuild --clean
npx expo run:android

# Using EAS Build
eas build --platform android --profile development
```

### Production Build (for Play Store)
```bash
# Build AAB (recommended for Play Store)
eas build --platform android --profile production

# Or APK for direct distribution
eas build --platform android --profile production --apk
```

---

## Important Files

### Configuration Files
- `app.json` - Main app configuration
- `AndroidManifest.xml` - Android permissions and settings
- `constants/iapProducts.ts` - In-app purchase product definitions

### Key Features
- `hooks/useInAppPurchases.ts` - IAP implementation
- `hooks/useNotifications.ts` - Daily notifications
- `context/GameContext.tsx` - Game state management

---

## Permissions

### Android Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```

---

## Signing Configuration

Before publishing, you'll need to configure signing in Google Play Console:

1. **Create upload key:**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore crostic-upload-key.keystore \
     -alias crostic-key \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Save keystore details:**
   - Store password: [Save securely]
   - Key alias: crostic-key
   - Key password: [Save securely]

3. **Configure in eas.json:**
   ```json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

---

## Testing Checklist

### Before Submitting to Play Store:

- [ ] Bundle ID is `com.betterapps.crostic`
- [ ] App name is "Crostic Puzzle"
- [ ] App icon is 512x512px
- [ ] Feature graphic is 1024x500px
- [ ] Screenshots prepared (min 2)
- [ ] Privacy policy URL ready
- [ ] IAP products created in Play Console
- [ ] IAP tested with license testers
- [ ] Notifications tested on real device
- [ ] All puzzles tested
- [ ] Dark mode tested
- [ ] Settings tested
- [ ] Achievements tested
- [ ] Daily missions tested

---

## Support & Documentation

### User Support
- Email: [Your support email]
- Privacy Policy: [Your privacy policy URL]
- Terms of Service: [Your terms URL]

### Developer Resources
- [ANDROID_IAP_SETUP.md](./ANDROID_IAP_SETUP.md) - IAP setup guide
- [NOTIFICATIONS_SETUP.md](./NOTIFICATIONS_SETUP.md) - Notifications guide
- [NATIVE_MODULES_FIX.md](./NATIVE_MODULES_FIX.md) - Native modules guide
- [PREMIUM_IMPLEMENTATION.md](./PREMIUM_IMPLEMENTATION.md) - Premium features

---

## Version History

### v1.0.0 (Current)
- Initial release
- 50+ puzzles across 5 chapters
- Daily missions system
- Streak tracking
- Achievements
- Coin shop with IAP
- Daily notifications
- Dark mode support
- Haptic feedback

---

## Next Steps

1. ✅ Bundle ID updated to `com.betterapps.crostic`
2. ⏳ Build production APK
3. ⏳ Create app in Google Play Console
4. ⏳ Configure in-app products
5. ⏳ Test with license testers
6. ⏳ Submit for review
7. ⏳ Publish to Play Store

---

## Contact

**Developer:** [Your Name]  
**Email:** [Your Email]  
**Website:** [Your Website]  
**Company:** Better Apps  

---

## Notes

- Product IDs are generic and don't need to change with bundle ID
- Make sure to use the SAME bundle ID across all builds
- Never change bundle ID after publishing (creates new app entry)
- Keep keystore file and passwords secure and backed up
