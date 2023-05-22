import React from 'react';
import {View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {Styles} from '../styles';
import AppText from './AppText';
import Icon from './Icon';

const ContactCard = ({
  icon,
  iconType,
  iconSize,
  iconColor,
  iconBtnStyle,
  cardTitle,
  cardSubTitle,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={Styles.contact_card_cont}>
        <Icon
          icon={icon}
          iconType={iconType}
          iconSize={iconSize}
          iconColor={iconColor}
          iconBtnStyle={[
            {
              paddingHorizontal: RFValue(10),
              marginBottom: RFValue(2),
            },
            iconBtnStyle,
          ]}
        />
        <View>
          <AppText children={cardTitle} style={Styles.contact_card_title} />
          <AppText
            children={cardSubTitle}
            style={Styles.contact_card_subTitle}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ContactCard;
