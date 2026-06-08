import { useEffect, useState } from 'react';

let remoteConfig: any = null;

try {
  remoteConfig = require('@react-native-firebase/remote-config').default;
} catch {
  // Not available in Expo Go / web
}

// Remote config keys
export const RC_KEYS = {
  INTERSTITIAL_AD_ENABLED: 'interstitial_ad_enabled',
  INTERSTITIAL_FREQUENCY: 'interstitial_frequency',
} as const;

// Defaults mirrored in Firebase console
const DEFAULTS: Record<string, boolean | number> = {
  [RC_KEYS.INTERSTITIAL_AD_ENABLED]: true,
  [RC_KEYS.INTERSTITIAL_FREQUENCY]: 3,
};

export interface RemoteConfigValues {
  interstitialAdEnabled: boolean;
  interstitialFrequency: number;
}

const FALLBACK: RemoteConfigValues = {
  interstitialAdEnabled: DEFAULTS[RC_KEYS.INTERSTITIAL_AD_ENABLED] as boolean,
  interstitialFrequency: DEFAULTS[RC_KEYS.INTERSTITIAL_FREQUENCY] as number,
};

export function useRemoteConfig(): RemoteConfigValues {
  const [values, setValues] = useState<RemoteConfigValues>(FALLBACK);

  useEffect(() => {
    if (!remoteConfig) return;

    const init = async () => {
      try {
        const rc = remoteConfig();
        await rc.setDefaults(DEFAULTS);
        // Cache expires after 1 hour in production; 0 in dev for fast iteration
        await rc.setConfigSettings({ minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000 });
        await rc.fetchAndActivate();

        setValues({
          interstitialAdEnabled: rc.getValue(RC_KEYS.INTERSTITIAL_AD_ENABLED).asBoolean(),
          interstitialFrequency: rc.getValue(RC_KEYS.INTERSTITIAL_FREQUENCY).asNumber(),
        });
      } catch (e) {
        // Network error or Firebase unavailable — keep defaults
      }
    };

    init();
  }, []);

  return values;
}
