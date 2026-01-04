import { Platform } from 'react-native';

const TEST_AD_UNITS = {
  banner: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  }),
  interstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  }),
  rewarded: Platform.select({
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  }),
};

const PRODUCTION_AD_UNITS = {
  banner: Platform.select({
    android: 'ca-app-pub-9220833502282451/8186805641',
    ios: 'ca-app-pub-9220833502282451/8186805641',
  }),
  interstitial: Platform.select({
    android: 'ca-app-pub-9220833502282451/5262943617',
    ios: 'ca-app-pub-9220833502282451/5262943617',
  }),
  rewarded: Platform.select({
    android: 'ca-app-pub-9220833502282451/5262943617',
    ios: 'ca-app-pub-9220833502282451/5262943617',
  }),
};

const IS_PRODUCTION = true;

export const AdService = {
  getAdUnitId: (type) => {
    const adUnits = IS_PRODUCTION ? PRODUCTION_AD_UNITS : TEST_AD_UNITS;
    return adUnits[type] || TEST_AD_UNITS[type];
  },

  getBannerAdUnitId: () => AdService.getAdUnitId('banner'),
  getInterstitialAdUnitId: () => AdService.getAdUnitId('interstitial'),
  getRewardedAdUnitId: () => AdService.getAdUnitId('rewarded'),

  isProduction: () => IS_PRODUCTION,
};

export default AdService;
