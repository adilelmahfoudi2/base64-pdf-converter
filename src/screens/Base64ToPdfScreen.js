import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  InteractionManager,
  Modal,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SharedFileContext } from '../../App';
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

const MAX_DISPLAY_LENGTH = 1000; // Only show first 1000 chars in TextInput

const Base64ToPdfScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const sharedFileContext = useContext(SharedFileContext);

  const [displayText, setDisplayText] = useState(''); // Text shown in TextInput
  const fullTextRef = useRef(''); // Full text stored in ref (not state)
  const [fileName, setFileName] = useState('converted_file');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [error, setError] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const [textLength, setTextLength] = useState(0);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Handle incoming base64 data from PdfToBase64Screen
  useEffect(() => {
    if (route?.params?.base64Data) {
      const text = route.params.base64Data;
      fullTextRef.current = text;
      setTextLength(text.length);
      
      const truncated = text.length > MAX_DISPLAY_LENGTH 
        ? text.substring(0, MAX_DISPLAY_LENGTH) + '...' 
        : text;
      setDisplayText(truncated);
    }
  }, [route?.params?.base64Data]);

  // Handle shared file content from other apps
  useEffect(() => {
    if (sharedFileContext?.sharedFileContent) {
      const text = sharedFileContext.sharedFileContent;
      fullTextRef.current = text;
      setTextLength(text.length);
      
      const truncated = text.length > MAX_DISPLAY_LENGTH 
        ? text.substring(0, MAX_DISPLAY_LENGTH) + '...' 
        : text;
      setDisplayText(truncated);
      
      // Clear the shared content
      sharedFileContext.setSharedFileContent(null);
      
      Alert.alert('File Received', `Loaded ${text.length.toLocaleString()} characters from shared file`);
    }
  }, [sharedFileContext?.sharedFileContent]);

  const handlePaste = useCallback(async () => {
    try {
      setIsPasting(true);
      const text = await Clipboard.getStringAsync();
      if (text) {
        // Store full text in ref
        fullTextRef.current = text;
        setTextLength(text.length);
        
        // Only display truncated version
        const truncated = text.length > MAX_DISPLAY_LENGTH 
          ? text.substring(0, MAX_DISPLAY_LENGTH) + '...' 
          : text;
        
        setDisplayText(truncated);
        setError('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err) {
      console.error('Paste error:', err);
    } finally {
      setIsPasting(false);
    }
  }, []);

  const handleClear = () => {
    setDisplayText('');
    fullTextRef.current = '';
    setTextLength(0);
    setConvertedFile(null);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleImportFromFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        
        if (content) {
          // Clean the content (remove whitespace and newlines)
          const cleanedContent = content.replace(/\s/g, '');
          
          fullTextRef.current = cleanedContent;
          setTextLength(cleanedContent.length);
          
          const truncated = cleanedContent.length > MAX_DISPLAY_LENGTH 
            ? cleanedContent.substring(0, MAX_DISPLAY_LENGTH) + '...' 
            : cleanedContent;
          
          setDisplayText(truncated);
          setError('');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Alert.alert('Success', `Imported ${cleanedContent.length.toLocaleString()} characters`);
        }
      }
    } catch (err) {
      console.error('Import error:', err);
      Alert.alert('Error', 'Failed to import file');
    }
  };

  const handleImportFromURL = () => {
    setShowUrlModal(true);
  };

  const handleDownloadFromURL = async () => {
    if (!urlInput || !urlInput.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }
    
    try {
      setIsPasting(true);
      setShowUrlModal(false);
      
      const response = await fetch(urlInput.trim());
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }
      
      const content = await response.text();
      const cleanedContent = content.replace(/\s/g, '');
      
      fullTextRef.current = cleanedContent;
      setTextLength(cleanedContent.length);
      
      const truncated = cleanedContent.length > MAX_DISPLAY_LENGTH 
        ? cleanedContent.substring(0, MAX_DISPLAY_LENGTH) + '...' 
        : cleanedContent;
      
      setDisplayText(truncated);
      setError('');
      setUrlInput('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Success', `Downloaded ${cleanedContent.length.toLocaleString()} characters`);
    } catch (err) {
      console.error('URL import error:', err);
      Alert.alert('Error', 'Failed to download from URL. Check the URL and try again.');
    } finally {
      setIsPasting(false);
    }
  };

  const handleConvert = async () => {
    const textToConvert = fullTextRef.current || displayText;
    if (!textToConvert.trim()) {
      setError(t('invalidBase64'));
      return;
    }

    setIsConverting(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await ConversionService.base64ToPdf(textToConvert, fileName);

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
                  icon="document-text-outline"
                  label="File"
                  onPress={handleImportFromFile}
                  size="small"
                />
                <ActionButton
                  icon="cloud-download-outline"
                  label="URL"
                  onPress={handleImportFromURL}
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
              value={displayText}
              onChangeText={(text) => {
                // For manual typing, update both display and full text
                setDisplayText(text);
                fullTextRef.current = text;
                setTextLength(text.length);
                setError('');
              }}
              editable={!isPasting}
              scrollEnabled={true}
              placeholder={t('enterBase64')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            {textLength > MAX_DISPLAY_LENGTH && (
              <Text style={[styles.infoText, { color: colors.primary }]}>
                📋 Pasted {textLength.toLocaleString()} characters (showing preview)
              </Text>
            )}

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
              disabled={!displayText.trim() && !fullTextRef.current}
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

      {/* URL Import Modal */}
      <Modal
        visible={showUrlModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUrlModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Import from URL
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter the URL of a text file containing Base64
            </Text>
            <TextInput
              style={[
                styles.urlInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://example.com/base64.txt"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => {
                  setShowUrlModal(false);
                  setUrlInput('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleDownloadFromURL}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Download
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  infoText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  urlInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});

export default Base64ToPdfScreen;
