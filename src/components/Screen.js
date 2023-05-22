import {SafeAreaView} from 'react-native';

import React, {Fragment} from 'react';
import {Styles} from '../styles';

function Screen({children, style}) {
  return (
    <Fragment>
      <SafeAreaView style={Styles.statusBarSafeArea} />
      <SafeAreaView style={[Styles.safeArea_, style]}>{children}</SafeAreaView>
    </Fragment>
  );
}

export default Screen;
