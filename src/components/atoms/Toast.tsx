import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  message: string;
  visible: boolean;
  type?: 'success' | 'error';
  onHide?: () => void;
};

export default function Toast({ message, visible, type = 'success', onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }
  }, [visible, message]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View style={[styles.container, type === 'error' && styles.error, { opacity }]}>
        <Text style={styles.icon}>{type === 'success' ? '✅' : '❌'}</Text>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  error: { backgroundColor: '#C0392B' },
  icon: { fontSize: 14 },
  text: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
