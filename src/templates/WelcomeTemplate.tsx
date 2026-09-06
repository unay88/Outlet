import React from 'react';
import {
  View, Image, TouchableOpacity, StyleSheet,
  Dimensions, Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../components/atoms/AppText';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.52;
const BG = '#F5A623';

type Props = { onGetStarted?: () => void };

export default function WelcomeTemplate({ onGetStarted }: Props) {
  return (
    <View style={styles.root}>
      {/* Top — image area */}
      <View style={styles.imageWrap}>
        <Image
          source={require('../assets/Illustration.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Bottom — white card */}
      <View style={styles.card}>
        <SafeAreaView style={styles.cardInner} edges={['bottom']}>
          <AppText style={styles.title}>Tailor Your Rewards{'\n'}Experience</AppText>
          <AppText style={styles.subtitle}>
            Convert points, redeem vouchers, and climb tiers. Your loyalty, your way. Begin your personalized rewards journey with Loyalify!
          </AppText>

          {/* Dots */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.btn} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.btnText}>Let's Get Started</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  imageWrap: {
    width,
    height: IMG_HEIGHT,
    backgroundColor: BG,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  cardInner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 4,
  },

  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 20,
    marginBottom: 'auto' as any,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 24,
    backgroundColor: BG,
  },

  btn: {
    width: '100%',
    backgroundColor: BG,
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: BG,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
