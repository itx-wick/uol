import React from 'react';
import {View, Pressable, FlatList, RefreshControl} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import moment from 'moment';

import {useDispatch, useSelector} from 'react-redux';
import {RFValue} from 'react-native-responsive-fontsize';
import {postApiCall} from '../services/ApiServices';
import {Commons} from '../utils';
import {logout} from '../redux/auth/authSlice';
import {COLORS, END_POINT, ROUTES} from '../constants';
import {setTestDetailsList, setUserExamItem} from '../redux/tabs/tabSlice';
import {setLoader} from '../redux/common/commonSlice';
import AppText from './AppText';
import {Styles} from '../styles';
import Icon from './Icon';

const UserExamsList = props => {
  const tabBarHeight = useBottomTabBarHeight();
  const dispatch = useDispatch();
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);

  const getTestDetails = (exam, instance) => {
    dispatch(setLoader(true));
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: exam.SubjectID,
      StartDate: moment(Date.now()).subtract(3, 'months').format('yyyy-MM-DD'),
      EndDate: moment(Date.now()).format('yyyy-MM-DD'),
    };
    console.log('Data', data);
    postApiCall(END_POINT.U_EXAM_DETAILS, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(instance.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            console.log('Exam Details', res.Data);
            dispatch(setUserExamItem(exam));
            dispatch(setTestDetailsList(res.Data.ExamDetails));
            Commons.navigate(instance.navigation, ROUTES.TEST_DETAILS);
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        console.warn(err);
        dispatch(setLoader(false));
      });
  };

  const ListItem = ({exam, index, instance}) => (
    <Pressable
      style={[
        Styles.test_list_item_card,
        {
          marginTop: index === 0 ? RFValue(5) : RFValue(5),
        },
      ]}
      onPress={() => {
        getTestDetails(exam, instance);
      }}>
      <View style={{width: '50%'}}>
        <AppText
          children={exam.SubjectName}
          numberOfLines={1}
          style={{
            fontWeight: 'bold',
            fontSize: RFValue(16),
            color: COLORS.black,
          }}
        />
        <AppText
          children={'Total Tests = ' + exam.TotalTests}
          style={{fontSize: RFValue(12), color: COLORS.black}}
        />
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{marginHorizontal: RFValue(5)}}>
          <AppText
            children={exam.SubjectPercent + '%'}
            style={{
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: RFValue(16),
              color:
                exam.SubjectPercent !== 'N/A' && exam.SubjectPercent <= '50'
                  ? COLORS.red
                  : exam.SubjectPercent <= '60'
                  ? COLORS.orange
                  : exam.SubjectPercent <= '75'
                  ? COLORS.purple
                  : exam.SubjectPercent >= '75'
                  ? COLORS.green
                  : COLORS.primary,
            }}
          />
          <AppText
            children={'Overall Percentage'}
            style={{
              fontSize: RFValue(12),
              color: COLORS.blue,
            }}
          />
        </View>
        <Icon
          iconType={'materialCommunity'}
          icon="chevron-right"
          iconSize={30}
          iconColor={COLORS.black}
          onClick={() => {
            getTestDetails(exam, instance);
          }}
        />
      </View>
    </Pressable>
  );

  const renderItem = ({item, index}) => (
    <ListItem exam={item} index={index} instance={props.instance} />
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
      refreshControl={
        <RefreshControl
          //refresh control used for the Pull to Refresh
          refreshing={props.refreshing}
          onRefresh={props.onRefresh}
        />
      }
      ListFooterComponent={
        <View style={{height: tabBarHeight + RFValue(75)}} />
      }
    />
  );
};

export default UserExamsList;
