import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Styles} from '../styles';
import {COLORS} from '../constants';
import AppText from './AppText';
import Icon from './Icon';

const DropDown = ({
  data = [],
  value = {},
  label = 'Choose an option',
  onSelect = () => {},
  contStyle,
  ...props
}) => {
  const [showOption, setShowOption] = useState(false);

  const onSelectedItem = val => {
    onSelect(val);
    setShowOption(false);
  };
  return (
    <View style={Styles.dropDownContainer}>
      <Pressable
        style={[Styles.dropDownStyle, contStyle]}
        onPress={() => {
          setShowOption(!showOption);
        }}>
        <AppText
          children={!!value ? value : label}
          style={Styles.selectedItemText}
        />
        <Icon
          iconType={'materialCommunity'}
          icon="menu-down"
          iconSize={26}
          iconColor={COLORS.black}
          iconStyle={{transform: [{rotate: showOption ? '180deg' : '0deg'}]}}
        />
      </Pressable>
      {showOption && (
        <View style={Styles.dropDownOptionCont}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {data.map((val, i) => {
              return (
                <Pressable
                  key={String(i)}
                  onPress={() => {
                    onSelectedItem(val);
                  }}
                  style={{
                    padding: RFValue(5),
                    borderBottomWidth: RFValue(0.5),
                    borderBottomColor: COLORS.gray,
                  }}>
                  <AppText
                    children={val.item}
                    style={[
                      Styles.dropDownOptionText,
                      {
                        color:
                          value?.id === val.id ? COLORS.white : COLORS.black,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default DropDown;
