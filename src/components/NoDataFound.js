import React from 'react';
import {Image, View} from 'react-native';
import {Styles} from '../styles';
import {IMAGES} from '../constants';

const NoDataFound = () => {
  return (
    <View style={{flex: 1}}>
      <Image source={IMAGES.noData} style={Styles.noDataImg2} />
    </View>
  );
};

export default NoDataFound;
