import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

type Variant = 'heading' | 'body' | 'caption';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  style?: object;
  numberOfLines?: number;
};

export default function AppText({ children, variant = 'body', style, numberOfLines }: Props) {
  return <Text style={[styles[variant], style]} numberOfLines={numberOfLines}>{children}</Text>;
}

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.heading,
    fontWeight: 'bold',
    color: colors.dark,
  },
  body: {
    fontSize: typography.body,
    color: colors.muted,
    lineHeight: 22,
  },
  caption: {
    fontSize: typography.caption,
    color: colors.subtle,
  },
});
