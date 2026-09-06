import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

type Props = { onFinish: () => void };

export default function SplashScreen({ onFinish }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fade, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();

    // Spin loop
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    // Navigate after 2.5s
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade }]}>
        {/* Icon */}
        <Text style={styles.icon}>🐾</Text>
        <Text style={styles.appName}>Outlet App</Text>
      </Animated.View>

      {/* Spinning ring */}
      <Animated.View style={[styles.spinnerWrap, { transform: [{ rotate }] }]}>
        <View style={styles.spinner} />
      </Animated.View>
    </View>
  );
}

const BG = '#F5A623';
const RING = 36;
const THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 72,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  spinnerWrap: {
    position: 'absolute',
    bottom: 80,
    width: RING,
    height: RING,
  },
  spinner: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: THICKNESS,
    borderColor: 'rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
  },
});
