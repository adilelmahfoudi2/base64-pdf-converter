import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/colors';

const GradientButton = ({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getGradientColors = () => {
    if (disabled) {
      return [colors.textMuted, colors.textMuted];
    }
    switch (variant) {
      case 'secondary':
        return colors.gradientSecondary;
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return colors.gradient;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
        };
      case 'large':
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
        };
      default:
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return FontSizes.sm;
      case 'large':
        return FontSizes.lg;
      default:
        return FontSizes.md;
    }
  };

  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          getSizeStyles(),
          isOutline && {
            borderWidth: 2,
            borderColor: colors.primary,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={isOutline ? colors.primary : '#ffffff'}
            size="small"
          />
        ) : (
          <View style={styles.content}>
            {icon && (
              <Ionicons
                name={icon}
                size={getTextSize() + 4}
                color={isOutline ? colors.primary : '#ffffff'}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  fontSize: getTextSize(),
                  color: isOutline ? colors.primary : '#ffffff',
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    fontWeight: FontWeights.semibold,
  },
});

export default GradientButton;
