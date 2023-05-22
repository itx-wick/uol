import {Pressable} from 'react-native';

import IconSet from './IconSets';
import React from 'react';
import {Styles} from '../styles';

function Icon({
  iconType,
  icon,
  iconColor,
  iconStyle,
  iconSize,
  iconBtnStyle,
  onClick,
}) {
  return (
    <Pressable
      activeOpacity={0.8}
      onPress={onClick}
      style={[Styles.iconIContainer, iconBtnStyle]}>
      {icon && (
        <IconSet
          type={iconType}
          name={icon}
          size={iconSize}
          color={iconColor}
          style={[Styles.iconIView, iconStyle]}
        />
      )}
    </Pressable>
  );
}

export default Icon;
