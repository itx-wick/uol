import React from 'react';
import {Styles} from '../styles';
import AppText from './AppText';

function ErrorMessage({message}) {
  return <AppText style={Styles.errorTxt}>{message}</AppText>;
}

export default ErrorMessage;
