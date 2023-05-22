import {Dimensions, Image, View} from 'react-native';

import {AppText} from '../components';
import React from 'react';
import {Styles} from '../styles';
const {width, height} = Dimensions.get('window');

const OnBoardingItem = ({item}) => {
  return (
    <View styles={Styles.slideItemCont}>
      <View style={[Styles.slideImageViewCont, {width}]}>
        <Image source={item.image} style={Styles.slide_image} />
      </View>
      <View style={Styles.slide_detail_cont}>
        <AppText style={Styles.slideTitle}>{item.title}</AppText>
        <AppText style={Styles.slideSubTitle}>{item.subTitle}</AppText>
      </View>
    </View>
  );
};

export default OnBoardingItem;
