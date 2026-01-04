import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useTheme } from '../context/ThemeContext';
import { AdService } from '../services/AdService';
import { Spacing } from '../constants/colors';

const BannerAd = ({ style }) => {
  const { colors } = useTheme();
  const [adError, setAdError] = useState(false);

  const adUnitId = __DEV__ ? TestIds.BANNER : AdService.getBannerAdUnitId();

  if (adError) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <GoogleBannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.log('Ad failed to load:', error);
          setAdError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
});

export default BannerAd;
