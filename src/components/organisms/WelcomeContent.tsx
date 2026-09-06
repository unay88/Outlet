import React from 'react';
import { View, StyleSheet } from 'react-native';
import WelcomeText from '../molecules/WelcomeText';
import Button from '../atoms/Button';

type Props = {
  onGetStarted?: () => void;
};

export default function WelcomeContent({ onGetStarted }: Props) {
  return (
    <View style={styles.container}>
      <WelcomeText />
      <Button label="Get Started" onPress={onGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
});
