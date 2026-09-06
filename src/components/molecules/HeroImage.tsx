import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function HeroImage() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Illustration.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height * 0.5,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
