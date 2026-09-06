import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

const orderAnonImg = require('../../assets/Group.png');
const orderCheckImg = require('../../assets/Group 33587.png');

type MenuCardProps = {
  title: string;
  image: any;
  imgStyle: object;
  onPress?: () => void;
};

function MenuCard({ title, image, imgStyle, onPress }: MenuCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <AppText style={styles.title}>{title}</AppText>
      <Image source={image} style={[styles.image, imgStyle]} resizeMode="contain" />
    </TouchableOpacity>
  );
}

export default function MenuCards() {
  return (
    <View style={styles.row}>
      <MenuCard
        title={'List Produk'}
        image={orderAnonImg}
        imgStyle={{ width: 90, height: 90, alignSelf: 'flex-start', marginTop: 8, marginLeft: -20 }}
      />
      <MenuCard
        title={'Order\nChecking'}
        image={orderCheckImg}
        imgStyle={{ width: 80, height: 80, alignSelf: 'flex-end' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#AAAAAA',
    lineHeight: 22,
  },
  image: {},
});
