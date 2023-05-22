import React from 'react';
import {View} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import {UIActivityIndicator} from 'react-native-indicators';
import {Styles} from '../styles';
import {COLORS} from '../constants';
import AppText from './AppText';

const ProgressLoader = ({progress}) => {
  return (
    <View style={Styles.loaderContainer}>
      <View style={Styles.progressLoaderIndicatorCont}>
        <>
          <CircularProgress
            value={50}
            radius={20}
            progressValueColor={COLORS.transparent}
            activeStrokeColor={COLORS.danger}
            inActiveStrokeColor={COLORS.danger}
            inActiveStrokeOpacity={0.1}
            activeStrokeWidth={5}
            inActiveStrokeWidth={5}
          />
          <AppText children={'Uploading'} style={Styles.progress_loader_text} />
        </>
      </View>
    </View>
  );
};

export default ProgressLoader;
