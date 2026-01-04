import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ConversionService } from '../services/ConversionService';
import { HistoryService } from '../services/HistoryService';
import { BorderRadius, FontSizes, Spacing } from '../constants/colors';

const HistoryItem = ({ item, onPress, onDelete }) => {
  const { colors } = useTheme();

  const getIcon = () => {
    return item.type === 'base64ToPdf' ? 'document-text' : 'code-slash';
  };

  const getTypeLabel = () => {
    return item.type === 'base64ToPdf' ? 'Base64 → PDF' : 'PDF → Base64';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.primary}15` },
        ]}
      >
        <Ionicons name={getIcon()} size={24} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.fileName, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.fileName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.type, { color: colors.primary }]}>
            {getTypeLabel()}
          </Text>
          <Text style={[styles.separator, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.size, { color: colors.textSecondary }]}>
            {ConversionService.formatFileSize(item.size)}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {HistoryService.formatDate(item.timestamp)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  fileName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  type: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: Spacing.xs,
    fontSize: FontSizes.xs,
  },
  size: {
    fontSize: FontSizes.xs,
  },
  date: {
    fontSize: FontSizes.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});

export default HistoryItem;
