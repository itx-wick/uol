import React from 'react';
import {View, Pressable, FlatList} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import moment from 'moment';

import {RFValue} from 'react-native-responsive-fontsize';
import {COLORS} from '../constants';
import AppText from './AppText';
import {Styles} from '../styles';
import Icon from './Icon';

const UserAttendanceList = props => {
  const tabBarHeight = useBottomTabBarHeight();

  const ListItem = ({attendance, index}) => (
    <>
      <Pressable
        style={[
          Styles.test_list_item_card,
          {
            marginTop: index === 0 ? RFValue(5) : RFValue(5),
          },
        ]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <AppText
            children={moment(attendance.Date).format('DD MMM yyyy') + ' '}
            style={{
              fontWeight: 'bold',
              fontSize: RFValue(12),
              color: COLORS.black,
            }}
          />
          <AppText
            children={attendance.StartTime}
            style={{fontSize: RFValue(12), color: COLORS.black}}
          />
          <AppText
            children={attendance.StartTime && attendance.StartTime ? ' - ' : ''}
            style={{fontSize: RFValue(12), color: COLORS.black}}
          />
          <AppText
            children={attendance.EndTime}
            style={{fontSize: RFValue(12), color: COLORS.black}}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{marginHorizontal: RFValue(5)}}>
            <AppText
              children={
                attendance.Status == 1
                  ? 'Present'
                  : attendance.Status == 2
                  ? 'Absent'
                  : attendance.Status == 3
                  ? 'Leave'
                  : attendance.Status == 4
                  ? 'Late'
                  : 'N/A'
              }
              style={{
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: RFValue(12),
                color: COLORS.black,
              }}
            />
          </View>
          <Icon
            iconType={'ant'}
            icon="checkcircle"
            iconSize={18}
            iconColor={
              attendance.Status == 1
                ? COLORS.green
                : attendance.Status == 2
                ? COLORS.danger
                : attendance.Status == 3
                ? COLORS.darkYellow
                : attendance.Status == 4
                ? COLORS.blue
                : COLORS.black
            }
          />
        </View>
      </Pressable>
    </>
  );

  const renderItem = ({item, index}) => (
    <ListItem attendance={item} index={index} />
  );

  return (
    <FlatList
      contentContainerStyle={{
        alignItems: 'center',
      }}
      showsVerticalScrollIndicator={false}
      data={props.data}
      renderItem={renderItem}
      keyExtractor={item => item.ID}
      ListFooterComponent={
        <View style={{height: tabBarHeight + RFValue(25)}} />
      }
    />
  );
};

export default UserAttendanceList;
