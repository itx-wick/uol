import React, {useState, useEffect} from 'react';
import {Keyboard, Pressable, ScrollView, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Styles} from '../styles';
import {COLORS} from '../constants';
import AppText from './AppText';
import Icon from './Icon';

const MultiSelectDD = ({
  data = [],
  selectedValues = [],
  label = 'Choose an option',
  onSelect = () => {},
  contStyle,
  ...props
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showOption, setShowOption] = useState(false);
  useEffect(() => {
    if (data.length !== 0) {
      let selected = data.filter(item => item.isSelected);
      setSelectedItems(selected);
      console.log(JSON.stringify(data, null, 2));
    }
  }, [data]);

  const onSelectedItem = val => {
    onSelect(val);
  };

  let selectedVal =
    selectedItems.length !== 0
      ? selectedItems.map(val => val.item).join(', ')
      : label;

  return (
    <View style={Styles.dropDownContainer}>
      <Pressable
        style={[Styles.dropDownStyle, contStyle]}
        onPress={() => {
          Keyboard.dismiss();
          setShowOption(!showOption);
        }}>
        <AppText
          children={selectedVal != null ? selectedVal : label}
          numberOfLines={1}
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
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <MaterialCommunityIcon
                    name={
                      val.isSelected
                        ? 'checkbox-marked'
                        : 'checkbox-blank-outline'
                    }
                    size={24}
                    color={COLORS.primary}
                  />
                  <AppText
                    children={val.item}
                    style={[Styles.dropDownOptionText, {marginLeft: 5}]}
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

export default MultiSelectDD;
