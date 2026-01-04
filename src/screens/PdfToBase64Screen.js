import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Header,
  Card,
  GradientButton,
  ActionButton,
  BannerAd,
} from '../components';
import { ConversionService } from '../services/ConversionService';
import { HistoryService } from '../services/HistoryService';
import { FontSizes, Spacing, BorderRadius } from '../constants/colors';

const PdfToBase64Screen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [base64Result, setBase64Result] = useState(null);
  const [error, setError] = useState('');

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
        });
        setBase64Result(null);
        setError('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err) {
      console.error('File picker error:', err);
      setError('Failed to select file');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError(t('noFileSelected'));
      return;
    }

    setIsConverting(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await ConversionService.pdfToBase64(selectedFile.uri);

      if (result.success) {
        setBase64Result(result);

        await HistoryService.addToHistory({
          type: 'pdfToBase64',
          fileName: selectedFile.name,
          size: selectedFile.size,
          base64Size: result.base64Size,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t('conversionSuccess'));
      } else {
        setError(result.error || t('conversionError'));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError(err.message || t('conversionError'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!base64Result?.base64) return;

    try {
      await Clipboard.setStringAsync(base64Result.base64);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('copiedToClipboard'));
    } catch (err) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleCopyWithPrefix = async () => {
    if (!base64Result?.base64) return;

    try {
      const withPrefix = `data:application/pdf;base64,${base64Result.base64}`;
      await Clipboard.setStringAsync(withPrefix);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('copiedToClipboard'), 'Copied with data URI prefix');
    } catch (err) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setBase64Result(null);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('pdfToBase64')}
        subtitle="Convert PDF file to Base64"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.uploadCard}>
          <TouchableOpacity
            onPress={handleSelectFile}
            activeOpacity={0.7}
            style={[
              styles.uploadArea,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: selectedFile ? colors.primary : colors.border,
              },
            ]}
          >
            {selectedFile ? (
              <View style={styles.selectedFileContainer}>
                <View
                  style={[
                    styles.fileIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Text style={[styles.pdfText, { color: colors.primary }]}>
                    PDF
                  </Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text
                    style={[styles.fileName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                    {ConversionService.formatFileSize(selectedFile.size)}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View
                  style={[
                    styles.uploadIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={40}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.uploadTitle, { color: colors.text }]}>
                  {t('selectPdf')}
                </Text>
                <Text style={[styles.uploadHint, { color: colors.textMuted }]}>
                  Tap to browse files
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          <GradientButton
            title={isConverting ? t('converting') : t('convert')}
            icon="swap-horizontal"
            onPress={handleConvert}
            loading={isConverting}
            disabled={!selectedFile}
            style={styles.convertButton}
          />
        </Card>

        {base64Result && (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                {t('base64Output')}
              </Text>
              <Text style={[styles.resultSize, { color: colors.textSecondary }]}>
                {ConversionService.formatFileSize(base64Result.base64Size)} (Base64)
              </Text>
            </View>

            <View
              style={[
                styles.base64Preview,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <Text
                style={[styles.base64Text, { color: colors.textSecondary }]}
                numberOfLines={6}
              >
                {base64Result.base64.substring(0, 500)}...
              </Text>
            </View>

            <View style={styles.resultActions}>
              <GradientButton
                title={t('copy')}
                icon="copy-outline"
                onPress={handleCopy}
                variant="outline"
                size="small"
                style={styles.actionBtn}
              />
              <GradientButton
                title="Copy with URI"
                icon="link-outline"
                onPress={handleCopyWithPrefix}
                size="small"
                style={styles.actionBtn}
              />
            </View>

            <View
              style={[
                styles.infoBox,
                { backgroundColor: `${colors.info}10`, borderColor: colors.info },
              ]}
            >
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={[styles.infoText, { color: colors.info }]}>
                "Copy with URI" includes the data:application/pdf;base64, prefix
              </Text>
            </View>
          </Card>
        )}

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
  uploadCard: {
    marginBottom: Spacing.md,
  },
  uploadArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  uploadHint: {
    fontSize: FontSizes.sm,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  fileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  fileName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  errorText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
  convertButton: {
    marginTop: Spacing.lg,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  resultHeader: {
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resultSize: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  base64Preview: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  base64Text: {
    fontSize: FontSizes.xs,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  adBanner: {
    marginTop: Spacing.lg,
  },
});

export default PdfToBase64Screen;
