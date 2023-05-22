import React from 'react';
import {View, Pressable, FlatList, RefreshControl} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import {RFValue} from 'react-native-responsive-fontsize';
import {COLORS} from '../constants';
import AppText from './AppText';
import {Styles} from '../styles';

const UserExamDetailList = props => {
  const tabBarHeight = useBottomTabBarHeight();

  const ListItem = ({exam, index}) => (
    <Pressable
      style={[
        Styles.test_detail_list_item_card,
        {
          marginTop: index === 0 ? RFValue(5) : RFValue(0),
        },
      ]}>
      <View style={Styles.test_detail_list_item_row_1}>
        <AppText
          children={`${exam.ExamTitle}${' [' + exam.ExamType + ']'}`}
          numberOfLines={1}
          style={{
            fontWeight: 'bold',
            fontSize: RFValue(12),
            color: COLORS.black,
          }}
        />
      </View>
      <View style={Styles.divider_full} />
      <View style={Styles.test_detail_list_item_row_1}>
        <View style={Styles.test_detail_list_item_row_1_col}>
          <AppText
            children={'Total Marks'}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
          <AppText
            children={exam.TotalMarks}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
        </View>
        <View style={Styles.test_detail_list_item_row_1_col}>
          <AppText
            children={'Pass Marks'}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
          <AppText
            children={exam.PassMarks}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
        </View>
        <View style={Styles.test_detail_list_item_row_1_col}>
          <AppText
            children={'Obtained'}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
          <AppText
            children={exam.ObtainedMarks}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
        </View>
        <View style={Styles.test_detail_list_item_row_1_col}>
          <AppText
            children={'%'}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
          <AppText
            children={exam.ExamPercent}
            style={{fontSize: RFValue(11)}}
          />
        </View>
        <View style={Styles.test_detail_list_item_row_1_col}>
          <AppText
            children={'Status'}
            style={{fontSize: RFValue(11), color: COLORS.black}}
          />
          <AppText
            children={exam.ExamStatus}
            style={{
              fontSize: RFValue(11),
              color:
                exam.ExamStatus == 'Pass'
                  ? exam.ExamPercent !== 'N/A' && exam.ExamPercent <= '50'
                    ? COLORS.red
                    : exam.ExamPercent <= '60'
                    ? COLORS.orange
                    : exam.ExamPercent <= '75'
                    ? COLORS.purple
                    : exam.ExamPercent >= '75'
                    ? COLORS.green
                    : COLORS.primary
                  : COLORS.danger,
            }}
          />
        </View>
      </View>
    </Pressable>
  );

  const renderItem = ({item, index}) => <ListItem exam={item} index={index} />;

  return (
    <FlatList
      contentContainerStyle={{
        alignItems: 'center',
      }}
      showsVerticalScrollIndicator={false}
      data={props.data}
      renderItem={renderItem}
      keyExtractor={item => item.ID}
      refreshControl={
        <RefreshControl
          //refresh control used for the Pull to Refresh
          refreshing={props.refreshing}
          onRefresh={props.onRefresh}
        />
      }
      ListFooterComponent={
        <View style={{height: tabBarHeight + RFValue(25)}} />
      }
    />
  );
};

export default UserExamDetailList;
