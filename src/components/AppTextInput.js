import {StyleSheet, TextInput, View} from 'react-native';

import React from 'react';
import {COLORS, DefaultTextStyle} from '../constants';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from './Icon';

function AppTextInput({
  icon,
  iconType,
  iconColor,
  iconSize,
  iconStyle,
  inputStyle,
  clearIcon,
  clearIconType,
  clearIconColor,
  clearIconSize,
  clearIconOnPress,
  clearIconStyle,
  clearInputStyle,
  textInputField,
  textStyle,
  ...otherProps
}) {
  return (
    <View style={[styles.container, inputStyle]}>
      {icon && (
        <Icon
          iconType={iconType}
          icon={icon}
          iconSize={iconSize}
          iconColor={iconColor}
          iconBtnStyle={iconStyle}
        />
      )}
      <TextInput
        style={[
          DefaultTextStyle.text,
          textStyle,
          styles.inputField,
          textInputField,
        ]}
        {...otherProps}
      />
      {clearIcon && (
        <Icon
          iconType={clearIconType}
          icon={clearIcon}
          iconSize={clearIconSize}
          iconColor={clearIconColor}
          iconBtnStyle={clearIconStyle}
          onClick={clearIconOnPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light,
    flexDirection: 'row',
    placeholderTextColor: COLORS.dark,
    borderColor: COLORS.black,
    alignItems: 'center',
  },
  icon: {
    marginRight: RFValue(5),
  },
  inputField: {
    fontSize: RFValue(12),
    color: 'black',
  },
});

export default AppTextInput;
