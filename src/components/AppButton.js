import {Text, Pressable} from 'react-native';

import React from 'react';
import {Styles} from '../styles';
import Icon from './Icon';

function AppButton({
  title,
  titleStyle,
  icon,
  iconType,
  iconColor,
  iconSize,
  iconStyle,
  inputStyle,
  onPress,
  btnStyle,
}) {
  return (
    <Pressable style={[Styles.appButton, btnStyle]} onPress={onPress}>
      {icon && (
        <Icon
          iconType={iconType}
          icon={icon}
          iconSize={iconSize}
          iconColor={iconColor}
          iconBtnStyle={iconStyle}
        />
      )}
      <Text style={[Styles.appText, titleStyle]}>{title}</Text>
    </Pressable>
  );
}

export default AppButton;
