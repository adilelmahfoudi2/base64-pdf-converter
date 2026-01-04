import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
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

const Base64ToPdfScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const inputRef = useRef(null);

  const [base64Input, setBase64Input] = useState('');
  const [fileName, setFileName] = useState('converted_file');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setBase64Input(text);
        setError('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err) {
      console.error('Paste error:', err);
    }
  };

  const handleClear = () => {
    setBase64Input('');
    setConvertedFile(null);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConvert = async () => {
    if (!base64Input.trim()) {
      setError(t('invalidBase64'));
      return;
    }

    setIsConverting(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await ConversionService.base64ToPdf(base64Input, fileName);

      if (result.success) {
        setConvertedFile(result);
        
        await HistoryService.addToHistory({
          type: 'base64ToPdf',
          fileName: result.fileName,
          size: result.size,
          uri: result.uri,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t('conversionSuccess'), `${t('fileName')}: ${result.fileName}`);
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

  const handleShare = async () => {
    if (!convertedFile?.uri) return;

    const result = await ConversionService.shareFile(convertedFile.uri);
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleSave = async () => {
    if (!convertedFile?.uri) return;

    const result = await ConversionService.saveToDownloads(
      convertedFile.uri,
      convertedFile.fileName
    );

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('fileSaved'));
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('base64ToPdf')}
        subtitle="Convert Base64 to PDF file"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={[styles.label, { color: colors.text }]}>
                Base64 Input
              </Text>
              <View style={styles.inputActions}>
                <ActionButton
                  icon="clipboard-outline"
                  label={t('paste')}
                  onPress={handlePaste}
                  size="small"
                />
                <ActionButton
                  icon="trash-outline"
                  label={t('clear')}
                  onPress={handleClear}
                  color={colors.error}
                  size="small"
                />
              </View>
            </View>

            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.text,
                  borderColor: error ? colors.error : colors.border,
                },
              ]}
              value={base64Input}
              onChangeText={(text) => {
                setBase64Input(text);
                setError('');
              }}
              placeholder={t('enterBase64')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            ) : null}

            <View style={styles.fileNameContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('fileName')}
              </Text>
              <TextInput
                style={[
                  styles.fileNameInput,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={fileName}
                onChangeText={setFileName}
                placeholder="Enter file name"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <GradientButton
              title={isConverting ? t('converting') : t('convert')}
              icon="swap-horizontal"
              onPress={handleConvert}
              loading={isConverting}
              disabled={!base64Input.trim()}
              style={styles.convertButton}
            />
          </Card>

          {convertedFile && (
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: `${colors.success}15` },
                  ]}
                >
                  <Text style={styles.pdfIcon}>PDF</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultFileName, { color: colors.text }]}>
                    {convertedFile.fileName}
                  </Text>
                  <Text
                    style={[styles.resultSize, { color: colors.textSecondary }]}
                  >
                    {ConversionService.formatFileSize(convertedFile.size)}
                  </Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <GradientButton
                  title={t('share')}
                  icon="share-outline"
                  onPress={handleShare}
                  variant="outline"
                  size="small"
                  style={styles.actionBtn}
                />
                <GradientButton
                  title={t('save')}
                  icon="download-outline"
                  onPress={handleSave}
                  size="small"
                  style={styles.actionBtn}
                />
              </View>
            </Card>
          )}

          <BannerAd style={styles.adBanner} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  inputCard: {
    marginBottom: Spacing.md,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  inputActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.md,
    fontSize: FontSizes.sm,
    minHeight: 180,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  fileNameContainer: {
    marginTop: Spacing.md,
  },
  fileNameInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  convertButton: {
    marginTop: Spacing.lg,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIcon: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  resultInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  resultFileName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resultSize: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  adBanner: {
    marginTop: Spacing.lg,
  },
});

export default Base64ToPdfScreen;
