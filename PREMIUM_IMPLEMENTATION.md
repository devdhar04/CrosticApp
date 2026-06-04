# Premium Implementation Without User Accounts

## Overview
Your app uses **In-App Purchases (IAP)** to sell premium features. The purchase is tied to the user's Apple ID / Google Play account, NOT an email signup.

## How It Works

### 1. **User Makes Purchase**
```typescript
// User taps "Remove Ads" for $3.99
// OR "Go Premium" subscription for $1.99/week
```

### 2. **App Store/Play Store Handles Payment**
- Apple/Google manages the entire payment flow
- User authenticates with their Apple ID / Google account
- Payment is charged to their credit card on file
- Store provides a **receipt** to prove purchase

### 3. **Your App Validates & Stores Receipt**
```typescript
// Expo In-App Purchases library
import * as InAppPurchases from 'expo-in-app-purchases';

// After successful purchase
const receipt = await InAppPurchases.finishTransactionAsync(purchase);
// Store receipt in AsyncStorage
await AsyncStorage.setItem('premium_receipt', JSON.stringify(receipt));
```

### 4. **On App Launch: Restore Purchases**
```typescript
// Check if user previously purchased
const purchases = await InAppPurchases.getPurchaseHistoryAsync();
// If premium receipt found, enable features
if (purchases.find(p => p.productId === 'remove_ads')) {
  setState({ removeAds: true });
}
```

## Implementation Steps

### Step 1: Install Expo IAP Package
```bash
cd artifacts/mobile
pnpm add expo-in-app-purchases
```

### Step 2: Define Products in App Store Connect / Google Play Console

**App Store Connect (iOS):**
- Product ID: `com.crosticpuzzle.removeads` (One-time)
- Product ID: `com.crosticpuzzle.premium.weekly` (Auto-renewable subscription)

**Google Play Console (Android):**
- Product ID: `remove_ads` (One-time)
- Product ID: `premium_weekly` (Subscription)

### Step 3: Update GameContext.tsx

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

// Product IDs
const PRODUCT_REMOVE_ADS = Platform.select({
  ios: 'com.crosticpuzzle.removeads',
  android: 'remove_ads',
});

const PRODUCT_PREMIUM = Platform.select({
  ios: 'com.crosticpuzzle.premium.weekly',
  android: 'premium_weekly',
});

// Initialize IAP on app start
useEffect(() => {
  InAppPurchases.connectAsync();
  restorePurchases();
  
  return () => InAppPurchases.disconnectAsync();
}, []);

// Restore previous purchases (called on app launch)
const restorePurchases = async () => {
  try {
    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    
    // Check if user owns "Remove Ads"
    const hasRemoveAds = results.some(
      p => p.productId === PRODUCT_REMOVE_ADS && p.acknowledged
    );
    
    // Check if user has active premium subscription
    const hasPremium = results.some(
      p => p.productId === PRODUCT_PREMIUM && p.acknowledged
    );
    
    update(prev => ({
      ...prev,
      removeAds: hasRemoveAds || hasPremium,
      isPremium: hasPremium,
    }));
  } catch (error) {
    console.error('Failed to restore purchases:', error);
  }
};

// Purchase Remove Ads
const purchaseRemoveAds = async () => {
  try {
    await InAppPurchases.purchaseItemAsync(PRODUCT_REMOVE_ADS);
    // Purchase listener will handle the rest
  } catch (error) {
    Alert.alert('Purchase Failed', error.message);
  }
};

// Purchase Premium Subscription
const purchasePremium = async () => {
  try {
    await InAppPurchases.purchaseItemAsync(PRODUCT_PREMIUM);
  } catch (error) {
    Alert.alert('Subscription Failed', error.message);
  }
};

// Listen for purchase updates
useEffect(() => {
  InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      results.forEach(async (purchase) => {
        if (!purchase.acknowledged) {
          // Acknowledge purchase
          await InAppPurchases.finishTransactionAsync(purchase, true);
          
          // Update state
          if (purchase.productId === PRODUCT_REMOVE_ADS) {
            update(prev => ({ ...prev, removeAds: true }));
            Alert.alert('🎉 Success!', 'Ads removed!');
          } else if (purchase.productId === PRODUCT_PREMIUM) {
            update(prev => ({ ...prev, isPremium: true, removeAds: true }));
            Alert.alert('🌟 Welcome to Premium!');
          }
        }
      });
    }
  });
}, []);
```

## Key Benefits

### ✅ No User Accounts Needed
- Purchases tied to Apple ID / Google account
- User can reinstall app and restore purchases
- No email, no password, no backend

### ✅ Works Across Devices (Same Apple ID / Google Account)
- If user has iPhone and iPad with same Apple ID
- Both devices can use premium features
- Automatic via "Restore Purchases"

### ✅ Secure
- Apple/Google validates all purchases
- Receipts are cryptographically signed
- Can't be faked by user

### ✅ Refunds Handled Automatically
- If user refunds purchase through App Store
- Apple/Google notifies your app
- Premium features automatically revoked

## Testing

### iOS Sandbox Testing
1. Create test Apple ID in App Store Connect
2. Sign in with test account on device
3. Make test purchases (no real charge)

### Android Testing
1. Add test account in Google Play Console
2. Test purchases with test account
3. No real charges

## Revenue Share
- **Apple:** Takes 30% (15% after 1st year for subscriptions)
- **Google:** Takes 15% (for subscriptions), 30% (for one-time)

## Alternative: RevenueCat (Recommended)

RevenueCat is a service that simplifies IAP:

```bash
pnpm add react-native-purchases
```

**Benefits:**
- Handles iOS + Android with one API
- Server-side receipt validation
- Analytics dashboard
- Subscription management
- Free up to $2,500/month revenue

**Code Example:**
```typescript
import Purchases from 'react-native-purchases';

// Initialize
Purchases.configure({ apiKey: 'your_key' });

// Purchase
await Purchases.purchasePackage(package);

// Check status
const customerInfo = await Purchases.getCustomerInfo();
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
```

## Summary

**For your app (no email signup):**

1. ✅ Use **In-App Purchases** (IAP)
2. ✅ Store purchase receipts locally in AsyncStorage
3. ✅ Call `restorePurchases()` on app launch
4. ✅ Purchases are tied to Apple ID / Google account
5. ✅ User can delete app and restore premium by tapping "Restore Purchases" button

**No backend required** - Apple and Google handle everything!
