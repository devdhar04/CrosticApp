# Android In-App Purchase Setup Guide

## ✅ Code Implementation Complete!

The code is now ready to accept real purchases on Android. Now you need to configure Google Play Console.

---

## Step 1: Build and Upload APK to Google Play Console

### Option A: Build Locally
```bash
cd artifacts/mobile
eas build --platform android --profile production
```

### Option B: Use Expo Application Services (EAS)
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android
```

---

## Step 2: Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name**: Crostic Puzzle
   - **Language**: English (US)
   - **App or game**: Game
   - **Free or paid**: Free
4. Complete declarations and click **Create app**

---

## Step 3: Upload APK to Internal Testing Track

1. In Play Console, go to **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload your APK/AAB file
4. Add release notes
5. Click **Review release** → **Start rollout**

---

## Step 4: Configure In-App Products

### Navigate to Products
1. In Play Console sidebar, go to **Monetize** → **Products** → **In-app products**
2. Click **Create product**

### Create Each Coin Pack

#### Product 1: Starter Pack
```
Product ID: coins_200_starter
Name: 200 Coins - Starter Pack
Description: Get 200 coins to unlock hints and solve puzzles faster!
Price: $0.99 USD
Status: Active
```

#### Product 2: Popular Pack
```
Product ID: coins_700_popular
Name: 700 Coins - Popular Pack
Description: Get 700 coins! Best value for puzzle solving.
Price: $2.99 USD
Status: Active
```

#### Product 3: Mega Pack
```
Product ID: coins_2000_mega
Name: 2000 Coins - Mega Pack
Description: Get 2000 coins! Perfect for puzzle masters.
Price: $7.99 USD
Status: Active
```

**Important Notes:**
- Product IDs must **exactly match** those in `constants/iapProducts.ts`
- Mark all products as **Active** after creation
- Save each product

---

## Step 5: Add License Testers

Before publishing, you need to test purchases without real charges:

1. Go to **Settings** → **License testing**
2. Click **Add license testers**
3. Add your Gmail accounts (the ones you'll test with)
4. Save

### Testing:
- License testers can make **free test purchases**
- No real money is charged
- Test purchases show up as "Test Purchase" in app

---

## Step 6: Test on Real Device

### Install Test Build
1. Add your Google account to internal testing list
2. Open the Play Store internal testing link on your Android device
3. Install the app

### Test Purchase Flow
1. Open the app
2. Go to Shop
3. Try buying a coin pack
4. Google Play payment sheet should appear
5. Complete purchase (won't be charged as tester)
6. Coins should be added to your balance
7. Check Play Console → **Order management** to verify test purchase

---

## Step 7: Handle Purchase States

The code already handles:

✅ **Success**: Coins added, purchase acknowledged  
✅ **Canceled**: User backs out, no charge  
✅ **Error**: Shows error message  
✅ **Pending**: Handled by Google Play  
✅ **Refund**: Google automatically revokes entitlement  

---

## Step 8: Publish App

Once testing is successful:

1. Complete all Play Store listing requirements:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (min 2)
   - Privacy policy URL
   - Content rating
   - Target audience
   - Store listing text

2. Go to **Production** → **Countries/Regions**
   - Select countries to publish in

3. Submit for review
   - Google reviews usually take 1-3 days

---

## Important Security Notes

### Current Implementation Uses:
- ✅ **Expo In-App Purchases** - Secure, battle-tested
- ✅ **Google Play Billing** - Official Android billing
- ✅ **Receipt validation** - Prevents fraud
- ✅ **Consumable products** - Coins are consumed on use

### What Happens on Purchase:
1. User taps "Buy"
2. Google Play payment sheet appears (secure)
3. User authenticates with their Google account
4. Payment processed by Google (not your app)
5. Google sends encrypted receipt to app
6. App validates receipt with Google servers
7. Coins added to user balance
8. Purchase marked as consumed

---

## Troubleshooting

### "Store not connected"
- Make sure app is installed from Play Store (not APK sideload)
- Check that product IDs in code match Google Play Console exactly
- Ensure products are marked as **Active** in Play Console

### "Item not available for purchase"
- Wait 2-4 hours after creating products in Play Console
- Products need time to propagate to Google's servers
- Try signing out/in of Google Play Store

### "Payment declined"
- For test accounts: Make sure account is added to License Testing
- For real purchases: User's payment method issue

### Products not loading
- Check logs: `console.log` statements in `useInAppPurchases.ts`
- Verify product IDs are correct
- Ensure app is signed with same keystore as Play Store version

---

## Revenue & Pricing

### Google's Fee Structure:
- **15%** for first $1M revenue/year (Google Play reduced fee)
- **30%** after $1M/year

### Price Tiers:
The prices you set ($0.99, $2.99, $7.99) will be converted to local currencies automatically by Google Play.

### Payout:
- Google pays monthly
- Minimum threshold: $5 USD
- Payment via bank transfer or other methods

---

## Next Steps

1. ✅ Code is ready (already done!)
2. ⏳ Build APK and upload to Play Console
3. ⏳ Create in-app products
4. ⏳ Add test accounts
5. ⏳ Test purchases
6. ⏳ Submit for review
7. ⏳ Publish app

---

## iOS Setup (Coming Later)

For iOS, you'll need:
- Apple Developer account ($99/year)
- App Store Connect setup
- Same product IDs configured in App Store Connect
- The code will work on iOS automatically (it's platform-agnostic)

---

## Support Resources

- [Google Play Billing Docs](https://developer.android.com/google/play/billing)
- [Expo IAP Docs](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)

---

## Testing Checklist

- [ ] Products created in Play Console
- [ ] Product IDs match code exactly
- [ ] All products marked as Active
- [ ] Test account added to License Testing
- [ ] App installed from Play Store internal testing
- [ ] Purchase flow works
- [ ] Coins are added after purchase
- [ ] Purchase appears in Play Console Order Management
- [ ] No crashes or errors

Once all checked ✓, you're ready to publish!
