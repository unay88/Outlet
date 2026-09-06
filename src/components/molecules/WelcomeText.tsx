import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

export default function WelcomeText() {
  return (
    <View style={styles.container}>
      <AppText variant="heading" style={styles.title}>
        <AppText variant="heading">Dedicated </AppText>
        <AppText variant="heading" style={{ color: colors.primary }}>
          {'Warehouse\nManager '}
        </AppText>
        <AppText variant="heading">Application</AppText>
      </AppText>
      <AppText variant="body" style={styles.subtitle}>
        You can log in if you have been introduced as an operator by the branch manager
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
