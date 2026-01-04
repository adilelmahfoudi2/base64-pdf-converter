import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Header, SettingsItem, Card, BannerAd } from '../components';
import { HistoryService } from '../services/HistoryService';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants/colors';

const SettingsScreen = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();

  const handleThemeToggle = () => {
    toggleTheme();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('language'),
      'Select your preferred language',
      [
        {
          text: 'العربية',
          onPress: () => {
            changeLanguage('ar');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
        {
          text: 'English',
          onPress: () => {
            changeLanguage('en');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      t('clearHistory'),
      'Are you sure you want to clear all conversion history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('deleteAll'),
          style: 'destructive',
          onPress: async () => {
            await HistoryService.clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'History cleared successfully');
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      android: 'https://play.google.com/store/apps/details?id=com.medziyad.base64pdfconverter',
      ios: 'https://apps.apple.com/app/idXXXXXXXXXX',
    });
    Linking.openURL(storeUrl);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };

  const handleAbout = () => {
    Alert.alert(
      t('about'),
      'Base64 PDF Converter\n\nVersion 1.0.0\n\nA powerful tool to convert between Base64 and PDF files.\n\n© 2024 All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings')} subtitle="Customize your experience" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <Card padding={0} style={styles.section}>
          <SettingsItem
            icon="moon-outline"
            title={t('darkMode')}
            subtitle={isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
            showSwitch
            switchValue={isDarkMode}
            onSwitchChange={handleThemeToggle}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="language-outline"
            title={t('language')}
            subtitle={language === 'ar' ? 'العربية' : 'English'}
            onPress={handleLanguageChange}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          DATA
        </Text>
        <Card padding={0} style={styles.section}>
          <SettingsItem
            icon="trash-outline"
            title={t('clearHistory')}
            subtitle="Delete all conversion history"
            onPress={handleClearHistory}
            danger
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ABOUT
        </Text>
        <Card padding={0} style={styles.section}>
          <SettingsItem
            icon="star-outline"
            title={t('rateApp')}
            subtitle="Rate us on the store"
            onPress={handleRateApp}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="shield-checkmark-outline"
            title={t('privacyPolicy')}
            subtitle="Read our privacy policy"
            onPress={handlePrivacyPolicy}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="information-circle-outline"
            title={t('about')}
            subtitle={`${t('version')} 1.0.0`}
            onPress={handleAbout}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Base64 PDF Converter
          </Text>
          <Text style={[styles.footerVersion, { color: colors.textMuted }]}>
            Version 1.0.0
          </Text>
        </View>

        <BannerAd style={styles.adBanner} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    marginLeft: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginLeft: 56 + Spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  footerText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  footerVersion: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  adBanner: {
    marginTop: Spacing.md,
  },
});

export default SettingsScreen;
