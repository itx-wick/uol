import React from 'react';
import {View} from 'react-native';
import {UIActivityIndicator} from 'react-native-indicators';
import {Styles} from '../styles';
import {COLORS} from '../constants';

const Loader = () => {
  return (
    <View style={Styles.loaderContainer}>
      <View style={Styles.loaderIndicatorContainer}>
        <UIActivityIndicator
          color={COLORS.primary}
          size={30}
          animationDuration={400}
        />
      </View>
    </View>
  );
};

export default Loader;
