import {Pressable, View} from 'react-native';

import AppText from './AppText';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import {Styles} from '../styles';
import {COLORS} from '../constants';

const CheckBox = props => {
  const iconName = props.isChecked
    ? 'checkbox-marked-circle'
    : 'checkbox-blank-circle-outline';

  return (
    <Pressable onPress={props.onPress}>
      <View style={[Styles.checkBoxContainer, props.viewDirection]}>
        <MaterialCommunityIcon
          name={iconName}
          size={props.checkBoxSize}
          color={(COLORS.primary, props.checkBoxColor)}
        />
        <AppText
          children={props.title}
          numberOfLines={1}
          style={[
            Styles.checkBoxTitle,
            {color: props.checkBoxLabelColor},
            props.labelTextStyle,
          ]}
        />
      </View>
    </Pressable>
  );
};

export default CheckBox;
