import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '../constants/colors';

const ActionButton = ({
  icon,
  label,
  onPress,
  color,
  size = 'medium',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const buttonColor = color || colors.primary;

  const getSize = () => {
    switch (size) {
      case 'small':
        return { icon: 18, padding: Spacing.sm };
      case 'large':
        return { icon: 28, padding: Spacing.lg };
      default:
        return { icon: 22, padding: Spacing.md };
    }
  };

  const sizeConfig = getSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: `${buttonColor}15`,
          padding: sizeConfig.padding,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={sizeConfig.icon}
        color={buttonColor}
      />
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: buttonColor,
              fontSize: size === 'small' ? FontSizes.xs : FontSizes.sm,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    minWidth: 60,
  },
  label: {
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
});

export default ActionButton;
