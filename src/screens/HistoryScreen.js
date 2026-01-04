import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Header,
  HistoryItem,
  EmptyState,
  GradientButton,
  BannerAd,
} from '../components';
import { HistoryService } from '../services/HistoryService';
import { Spacing } from '../constants/colors';

const HistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await HistoryService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadHistory();
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await HistoryService.deleteFromHistory(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            loadHistory();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      t('clearHistory'),
      'Are you sure you want to clear all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('deleteAll'),
          style: 'destructive',
          onPress: async () => {
            await HistoryService.clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleItemPress = (item) => {
    if (item.type === 'base64ToPdf') {
      navigation.navigate('Base64ToPdf');
    } else {
      navigation.navigate('PdfToBase64');
    }
  };

  const renderItem = ({ item }) => (
    <HistoryItem
      item={item}
      onPress={() => handleItemPress(item)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const renderHeader = () => {
    if (history.length === 0) return null;

    return (
      <View style={styles.listHeader}>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
          {history.length} item{history.length !== 1 ? 's' : ''}
        </Text>
        <GradientButton
          title={t('clearHistory')}
          icon="trash-outline"
          onPress={handleClearAll}
          variant="outline"
          size="small"
        />
      </View>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      icon="time-outline"
      title={t('noHistory')}
      description="Your conversion history will appear here"
      buttonTitle={t('startConverting')}
      onButtonPress={() => navigation.navigate('Home')}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('history')} subtitle="Your recent conversions" />

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {history.length > 0 && (
        <View style={styles.adContainer}>
          <BannerAd />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  itemCount: {
    fontSize: 14,
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default HistoryScreen;
