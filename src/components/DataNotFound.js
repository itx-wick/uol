import React from 'react';
import {Image, View} from 'react-native';
import {Styles} from '../styles';
import {IMAGES} from '../constants';

const DataNotFound = () => {
  return (
    <View style={{flex: 1}}>
      <Image source={IMAGES.noData} style={Styles.noDataImg} />
    </View>
  );
};

export default DataNotFound;
