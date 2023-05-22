import {Dimensions, Image, Pressable, Text, View} from 'react-native';
import {COLORS} from '../constants';
import {Styles} from '../styles';
import React from 'react';

import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {RFValue} from 'react-native-responsive-fontsize';

const {width, height} = Dimensions.get('screen');
const Header = props => {
  return (
    <View
      style={
        props.transparent
          ? [
              Styles.headerBar,
              {backgroundColor: 'transparent', height: 0, padding: 0},
            ]
          : Styles.headerBar
      }>
      <Text
        style={[
          Styles.headerTitle,
          {position: 'absolute', width: width, justifyContent: 'center'},
        ]}>
        {props.title}
      </Text>

      <View style={{flexDirection: 'row'}}>
        {props.showBackButton && (
          <Pressable onPress={props.onBackPress}>
            <View style={Styles.headerLeftButton}>
              <Icon
                name={'arrow-back-sharp'}
                color={COLORS.black}
                size={RFValue(26)}
              />
            </View>
          </Pressable>
        )}

        {props.showDrawerBtn && (
          <Pressable onPress={props.onDrawerPress}>
            <View style={Styles.headerLeftButton}>
              <Icon name={'menu'} color={COLORS.black} size={RFValue(26)} />
            </View>
          </Pressable>
        )}
      </View>

      <View style={{flexDirection: 'row'}}>
        {props.showAttachmentBtn && (
          <Pressable
            onPress={props.onAttachmentBtnPress}
            style={{
              width: RFValue(30),
              height: RFValue(30),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: RFValue(10),
            }}>
            <View style={[Styles.headerRightButton]}>
              <MIcon
                name={'attachment'}
                color={COLORS.black}
                size={RFValue(26)}
              />
            </View>
          </Pressable>
        )}
        {props.showRightBtn && (
          <Pressable
            onPress={props.onRightBtnPress}
            style={{
              width: RFValue(30),
              height: RFValue(30),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: RFValue(5),
            }}>
            <View style={[Styles.headerRightButton]}>
              <MIcon name={'check'} color={COLORS.black} size={RFValue(26)} />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default Header;
