# Google AdMob Integration Guide

## ✅ Implementation Complete!

AdMob is now integrated into your app. Real ads will show in production builds.

---

## Ad Types Implemented

### 1. **Rewarded Video Ads** ✅
**Where:** When user needs coins for hints
**Purpose:** Watch ad → Get 30 coins
**User Experience:** Opt-in, rewards user for watching

### 2. **Interstitial Ads** ✅ (Ready to use)
**Where:** Between puzzles (after every 3 puzzles)
**Purpose:** Monetize during natural break points
**User Experience:** Full-screen ad shown briefly

### 3. **Banner Ads** ✅ (Code ready, disabled by default)
**Where:** Can be placed on Shop/Home screen
**Purpose:** Passive revenue
**User Experience:** Small banner at top/bottom

---

## Step 1: Create AdMob Account

1. Go to [AdMob Console](https://apps.admob.google.com/)
2. Sign in with Google account
3. Click **"Get Started"**
4. Accept terms and conditions

---

## Step 2: Create Your App

1. In AdMob console, click **"Apps"** → **"Add App"**
2. Select **"Android"** platform
3. **Is your app listed on Google Play?**
   - If yes: Search and select it
   - If no: Select "No" and enter app name: **"Crostic Puzzle"**
4. Click **"Add App"**
5. **Save your App ID** (looks like: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

---

## Step 3: Create Ad Units

### Create Rewarded Ad Unit (For Coins)

1. Click **"Ad Units"** → **"Add Ad Unit"**
2. Select **"Rewarded"**
3. **Ad unit name:** `Coins Reward`
4. Click **"Create Ad Unit"**
5. **Copy the Ad Unit ID** (looks like: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### Create Interstitial Ad Unit (Between Puzzles)

1. Click **"Ad Units"** → **"Add Ad Unit"**
2. Select **"Interstitial"**
3. **Ad unit name:** `Puzzle Complete`
4. Click **"Create Ad Unit"**
5. **Copy the Ad Unit ID**

### Create Banner Ad Unit (Optional)

1. Click **"Ad Units"** → **"Add Ad Unit"**
2. Select **"Banner"**
3. **Ad unit name:** `Shop Banner`
4. Select **"Banner (320x50)**
5. Click **"Create Ad Unit"**
6. **Copy the Ad Unit ID**

---

## Step 4: Update Your Code with Real Ad IDs

### A. Update `app.json`

Replace the test App ID with your real App ID:

```json
"android": {
  "config": {
    "googleMobileAdsAppId": "ca-app-pub-YOUR-APP-ID~XXXXXXXXXX"
  }
}
```

### B. Update `constants/adConfig.ts`

Replace the PRODUCTION_IDS with your real Ad Unit IDs:

```typescript
const PRODUCTION_IDS = {
  BANNER: Platform.select({
    android: 'ca-app-pub-YOUR-APP-ID/BANNER-UNIT-ID',
    ios: 'ca-app-pub-YOUR-APP-ID/BANNER-UNIT-ID',
  }),
  INTERSTITIAL: Platform.select({
    android: 'ca-app-pub-YOUR-APP-ID/INTERSTITIAL-UNIT-ID',
    ios: 'ca-app-pub-YOUR-APP-ID/INTERSTITIAL-UNIT-ID',
  }),
  REWARDED: Platform.select({
    android: 'ca-app-pub-YOUR-APP-ID/REWARDED-UNIT-ID',
    ios: 'ca-app-pub-YOUR-APP-ID/REWARDED-UNIT-ID',
  }),
};
```

Also update the ADMOB_APP_ID:

```typescript
export const ADMOB_APP_ID = Platform.select({
  android: 'ca-app-pub-YOUR-APP-ID~XXXXXXXXXX',
  ios: 'ca-app-pub-YOUR-APP-ID~XXXXXXXXXX',
});
```

---

## Step 5: Testing Ads

### Development Testing (Current)

The app is configured to use **Google Test Ad IDs** in development mode.

Test ads will show:
- ✅ In Expo Go (will show "Demo Mode" alert)
- ✅ In development builds
- ✅ Before uploading real Ad Unit IDs

**Important:** Test ads don't generate revenue!

### Testing Real Ads

1. **Build production APK:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Install on test device**

3. **Enable Test Mode:**
   - In AdMob console → **Settings** → **Test Devices**
   - Add your device ID
   - This allows you to see real ads without generating invalid clicks

4. **Test each ad type:**
   - Rewarded: Go to Shop → Watch ad for coins
   - Interstitial: Complete 3 puzzles in a row
   - Banner: Enable in `adConfig.ts` and check Shop/Home

---

## Step 6: Ad Implementation Details

### Current Ad Flow:

#### Rewarded Ads (For Coins):
```
User needs coins → Clicks "Watch Ad" 
→ AdMob loads ad → User watches video 
→ User gets 30 coins → Can use hint
```

**Where used:**
- Shop screen - Free coins section
- Out of coins modal (during puzzle)

#### Interstitial Ads (Between Puzzles):
```
User completes puzzle → Show congrats modal 
→ Check if 3rd puzzle → Show interstitial ad 
→ Continue to next puzzle
```

**Configuration in `context/GameContext.tsx`:**
```typescript
puzzlesSinceInterstitial: 0, // Tracks puzzle count
```

Frequency controlled in `adConfig.ts`:
```typescript
INTERSTITIAL_FREQUENCY: 3, // Show after every 3 puzzles
```

---

## Step 7: Monetization Settings

### Adjust Ad Frequency

Edit `constants/adConfig.ts`:

```typescript
export const AD_CONFIG = {
  // Show banner ads (set to true to enable)
  SHOW_BANNER_ON_HOME: false,
  SHOW_BANNER_ON_SHOP: false,
  SHOW_BANNER_IN_PUZZLE: false,

  // Interstitial ad frequency
  INTERSTITIAL_FREQUENCY: 3, // Change to 2, 4, 5, etc.

  // Rewarded ad coin reward
  REWARDED_AD_COINS: 30, // Change reward amount
};
```

### Ad Placement Best Practices

✅ **Good Ad Placements:**
- Between puzzles (natural break)
- Before starting new chapter
- In shop screen (not during purchase flow)
- Rewarded ads for optional benefits

❌ **Bad Ad Placements:**
- During active gameplay (puzzles)
- During purchase flow
- Too frequently (annoys users)
- Forced interstitials (no opt-out)

---

## Step 8: Revenue Optimization

### Expected Revenue (Rough Estimates):

**Rewarded Video Ads:**
- CPM: $10-30 (varies by country)
- Per view: $0.01-$0.03
- Best earning ad type

**Interstitial Ads:**
- CPM: $5-15
- Per view: $0.005-$0.015
- High fill rate

**Banner Ads:**
- CPM: $1-5
- Per impression: $0.001-$0.005
- Consistent but low

### Maximizing Revenue:

1. **Use Mediation** (AdMob built-in):
   - Automatically shows highest-paying ad
   - Increases fill rate
   - Setup in AdMob console → Mediation

2. **Optimize Ad Frequency:**
   - Too few ads = low revenue
   - Too many ads = users quit
   - Sweet spot: Every 3-5 puzzles

3. **Focus on Rewarded Ads:**
   - Highest CPM
   - Best user experience
   - Users actively choose to watch

4. **Remove Ads IAP:**
   - Charge $3.99 to remove ads
   - Users who pay > Ad revenue per user
   - Already implemented in your app!

---

## Step 9: Compliance & Policies

### Google Play Policies

✅ **Required:**
- Privacy policy mentioning ads
- COPPA compliance (if targeting children)
- Ads must not obstruct core functionality
- No accidental clicks (proper spacing)

✅ **Your App Already Complies:**
- Ads are optional (rewarded)
- Interstitials at natural breaks
- "Remove Ads" purchase available
- Clear ad indicators

### GDPR & Privacy (Europe)

AdMob automatically handles:
- ✅ Consent forms (EU users)
- ✅ Personalized vs non-personalized ads
- ✅ User privacy choices

You must:
- ✅ Add privacy policy URL in Play Store listing
- ✅ Mention "uses Google AdMob for advertising"

---

## Step 10: Analytics & Monitoring

### Track Ad Performance in AdMob:

1. **Impressions** - How many ads shown
2. **Click-through rate (CTR)** - % of users clicking
3. **eCPM** - Effective cost per 1000 impressions
4. **Revenue** - Money earned

### Optimize Based on Data:

- Low impressions? → Increase ad frequency
- Low CTR? → Check ad placement
- Low eCPM? → Enable mediation, check targeting
- Users quitting? → Reduce ad frequency

---

## Testing Checklist

Before publishing:

- [ ] AdMob account created
- [ ] App added to AdMob
- [ ] 3 ad units created (Rewarded, Interstitial, Banner)
- [ ] Real Ad Unit IDs added to code
- [ ] Real App ID added to app.json
- [ ] Production build created
- [ ] Test device added to AdMob
- [ ] Rewarded ad tested (watch video, get coins)
- [ ] Interstitial ad tested (after 3 puzzles)
- [ ] Ads not showing during gameplay
- [ ] "Remove Ads" IAP tested
- [ ] Privacy policy mentions ads

---

## Troubleshooting

### "Ad failed to load"
- Wait 1-2 hours after creating ad units (propagation time)
- Check internet connection
- Verify Ad Unit IDs are correct
- Check AdMob account is approved

### "Ad not showing"
- Using test IDs in development? → Normal
- Using real IDs in production? → Check device added as test device
- First 24 hours? → Low fill rate initially
- Check AdMob account status (not suspended)

### "Invalid Traffic" warning
- Don't click your own ads (use test device mode)
- Don't ask users to click ads
- Don't incentivize interstitial/banner ad clicks
- Only reward for completed video ads

---

## Revenue Timeline

**Week 1-2:**
- Low fill rate (few ads available)
- eCPM: $0.50-$2
- Getting to know your users

**Month 1:**
- Fill rate stabilizes
- eCPM: $2-$5
- Ad network optimization begins

**Month 3+:**
- Mature ad serving
- eCPM: $5-$15+
- Best revenue potential

---

## Summary

✅ **AdMob SDK integrated**  
✅ **Rewarded ads for coins (main monetization)**  
✅ **Interstitial ads between puzzles**  
✅ **Banner ads code ready (optional)**  
✅ **Test IDs working in development**  
✅ **Production IDs ready to add**  
✅ **User-friendly ad placement**  
✅ **"Remove Ads" IAP available**  

**Next Steps:**
1. Create AdMob account
2. Add app and create ad units
3. Update code with real IDs
4. Build production APK
5. Test with test device
6. Publish to Play Store
7. Monitor AdMob dashboard
8. Optimize based on data

Your app is ready to generate revenue! 💰
