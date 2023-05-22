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
import {setTeacherExamDetails, setTeacherExamID} from '../redux/tabs/tabSlice';
import {setLoader} from '../redux/common/commonSlice';
import AppText from './AppText';
import {Styles} from '../styles';
import Icon from './Icon';

const TeacherExamList = props => {
  const dispatch = useDispatch();
  const tabBarHeight = useBottomTabBarHeight();
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);

  const getExamDetails = (id, instance) => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      ExamID: id,
    };
    postApiCall(END_POINT.T_EXAM_DETAILS, params)
      .then(res => {
        dispatch(setTeacherExamID(id));
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(instance.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length == 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setTeacherExamDetails(res.Data.Exam));
            Commons.navigate(instance.navigation, ROUTES.T_EXAM_DETAILS);
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
        {
          user.ViewExams == 1 && getExamDetails(exam.ID, instance);
        }
      }}>
      <View style={{width: '90%'}}>
        <AppText
          children={exam.Title}
          numberOfLines={1}
          style={{
            fontWeight: 'bold',
            fontSize: RFValue(16),
            color: COLORS.black,
          }}
        />
        <View style={{flexDirection: 'row'}}>
          <AppText
            children={exam.Class}
            style={{fontSize: RFValue(12), color: COLORS.black}}
          />
          <AppText
            children={` [${exam.Batch}]`}
            style={{fontSize: RFValue(12), color: COLORS.black}}
          />
        </View>
        <AppText
          children={`${moment(exam.Date).format('DD MMM yyyy')}`}
          style={{fontSize: RFValue(12), color: COLORS.black}}
        />
      </View>
      <Icon
        iconType={'materialCommunity'}
        icon="chevron-right"
        iconSize={30}
        iconColor={COLORS.black}
        onClick={() => {
          {
            user.ViewExams == 1 && getExamDetails(exam.ID, instance);
          }
        }}
      />
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
      ListFooterComponent={<View style={{height: RFValue(110)}} />}
    />
  );
};

export default TeacherExamList;
