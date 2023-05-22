import React, {useState, useEffect} from 'react';
import {Image, Pressable, View, RefreshControl} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useDispatch, useSelector} from 'react-redux';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Screen, Header, Loader, AppText, Icon} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {
  setAttendanceDetailsList,
  setAttendanceList,
  setUserAttendanceItem,
} from '../../../redux/tabs/tabSlice';
import {Styles} from '../../../styles';
import {Commons} from '../../../utils';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {postApiCall} from '../../../services/ApiServices';
import {logout} from '../../../redux/auth/authSlice';
import {setLoader} from '../../../redux/common/commonSlice';
import moment from 'moment';

function Attendance(props) {
  const dispatch = useDispatch();
  const tabBarHeight = useBottomTabBarHeight();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);
  const attendances = useSelector(state => state.Tab.presentList);
  const dashStat = useSelector(state => state.Tab.dashStat);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateCheck, setDateCheck] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    getAttendanceRecord();
  }, [fromDate, toDate]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setFromDate('');
      setToDate('');
      getAttendanceRecord();
    });
    return unsubscribe;
  }, [props.navigation]);

  const onRefresh = () => {
    getAttendanceRecord();
  };

  const getAttendanceRecord = () => {
    setRefreshing(true);
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      StartDate: fromDate,
      EndDate: toDate,
    };
    postApiCall(END_POINT.U_ATTENDANCE, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setAttendanceList(res.Data.Attendances));
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        setRefreshing(false);
      })
      .catch(err => {
        console.warn(err);
        setRefreshing(false);
      });
  };

  const getAttendanceDetails = lecture => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: lecture.ID,
      LectureTypeID: lecture.LectureTypeID,
      StartDate: moment(Date.now()).subtract(6, 'months').format('yyyy-MM-DD'),
      EndDate: moment(Date.now()).format('yyyy-MM-DD'),
    };
    postApiCall(END_POINT.U_ATTENDANCE_DETAILS, params)
      .then(res => {
        dispatch(setUserAttendanceItem(lecture));
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setAttendanceDetailsList(res.Data.Details));
            Commons.navigate(props.navigation, ROUTES.ATTENDANCE_DETAILS);
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

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const pickADate = (date, check) => {
    let tempDate = new Date(date);
    let year = tempDate.getFullYear();
    let month = ('0' + (tempDate.getMonth() + 1)).slice(-2);
    let day =
      tempDate.getDate() < 10 ? '0' + tempDate.getDate() : tempDate.getDate();
    let fDate = `${year}-${month}-${day}`;
    if (check === 'From') {
      setFromDate(fDate);
    } else {
      setToDate(fDate);
    }
    hideDatePicker();
  };

  const ListItem = data => {
    const [itemSelected, setItemSelected] = useState(false);
    return (
      <>
        <Pressable
          style={Styles.test_list_item_card}
          onPress={() => {
            setItemSelected(!itemSelected);
          }}>
          <View style={{width: '50%'}}>
            <AppText
              children={data.item.SubjectName}
              numberOfLines={1}
              style={{
                fontWeight: 'bold',
                fontSize: RFValue(16),
                color: COLORS.black,
              }}
            />
            <AppText
              children={'Total Lectures = ' + data.item.TotalLectures}
              style={{fontSize: RFValue(12), color: COLORS.black}}
            />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{marginHorizontal: RFValue(5)}}>
              <AppText
                children={data.item.TotalPresentPercent + '%'}
                style={{
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: RFValue(16),
                  color:
                    data.item.TotalPresentPercent !== 'N/A' &&
                    data.item.TotalPresentPercent <= '50'
                      ? COLORS.red
                      : data.item.TotalPresentPercent <= '60'
                      ? COLORS.orange
                      : data.item.TotalPresentPercent <= '75'
                      ? COLORS.purple
                      : data.item.TotalPresentPercent >= '75'
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
              icon="chevron-down"
              iconSize={30}
              iconColor={COLORS.black}
              iconStyle={{
                transform: [{rotate: itemSelected ? '180deg' : '0deg'}],
              }}
              onClick={() => {
                setItemSelected(!itemSelected);
              }}
            />
          </View>
        </Pressable>
        {itemSelected && (
          <View style={Styles.attendance_lectures_list_cont}>
            {data.item.Lectures.map(lecture => {
              return (
                <Pressable
                  onPress={() => {
                    getAttendanceDetails(lecture);
                  }}>
                  <View style={Styles.attendance_lectures_list_item}>
                    <View style={{width: '65%'}}>
                      <AppText
                        children={lecture.LectureType}
                        numberOfLines={1}
                        style={{
                          fontWeight: 'bold',
                          fontSize: RFValue(16),
                          color: COLORS.black,
                        }}
                      />
                      <AppText
                        children={'Total Lectures = ' + lecture.Lectures}
                        style={{fontSize: RFValue(12), color: COLORS.black}}
                      />
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <AppText
                        children={lecture.PresentPercent + '%'}
                        style={{
                          color:
                            lecture.PresentPercent !== 'N/A' &&
                            lecture.PresentPercent <= '50'
                              ? COLORS.red
                              : lecture.PresentPercent <= '60'
                              ? COLORS.orange
                              : lecture.PresentPercent <= '75'
                              ? COLORS.purple
                              : lecture.PresentPercent >= '75'
                              ? COLORS.green
                              : COLORS.primary,
                        }}
                      />
                      <Icon
                        iconType={'materialCommunity'}
                        icon="chevron-right"
                        iconSize={30}
                        iconColor={COLORS.black}
                        onClick={() => {
                          getAttendanceDetails(lecture);
                        }}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </>
    );
  };

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Attendance'}
          showBackButton={false}
          showDrawerBtn={true}
          onDrawerPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <View style={Styles.attendance_main_cont}>
          <View
            style={[
              Styles.statHeaderView,
              {
                backgroundColor:
                  dashStat.OverallPresentPercent !== 'N/A' &&
                  dashStat.OverallPresentPercent <= '50'
                    ? COLORS.red
                    : dashStat.OverallPresentPercent <= '60'
                    ? COLORS.orange
                    : dashStat.OverallPresentPercent <= '75'
                    ? COLORS.purple
                    : dashStat.OverallPresentPercent >= '75'
                    ? COLORS.green
                    : COLORS.primary,
              },
            ]}>
            <AppText
              children={
                dashStat.OverallPresentPercent === 'undefined' ||
                dashStat.OverallPresentPercent === 'null' ||
                dashStat.OverallPresentPercent === 'N/A'
                  ? 'Overall Attendance Percentage 0%'
                  : 'Overall Attendance Percentage ' +
                    dashStat.OverallPresentPercent
              }
              style={{color: COLORS.white}}
            />
          </View>

          <View style={Styles.dates_cont}>
            <Pressable
              onPress={() => {
                setDateCheck(true);
                showDatePicker();
              }}
              style={Styles.from_date_cont}>
              <AppText children={'From Date'} style={Styles.date_view_title} />
              <AppText
                children={fromDate ? fromDate : 'Select Date'}
                style={Styles.date_view_text}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setDateCheck(false);
                showDatePicker();
              }}
              style={Styles.to_date_cont}>
              <AppText children={'To Date'} style={Styles.date_view_title} />
              <AppText
                children={toDate ? toDate : 'Select Date'}
                style={Styles.date_view_text}
              />
            </Pressable>
          </View>
          {attendances.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                alignItems: 'center',
              }}
              data={attendances}
              renderItem={({item}) => <ListItem item={item} />}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  //refresh control used for the Pull to Refresh
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              ListFooterComponent={
                <View style={{height: tabBarHeight + RFValue(75)}} />
              }
            />
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  //refresh control used for the Pull to Refresh
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }>
              <View style={{flex: 1}}>
                <Image source={IMAGES.noData} style={Styles.noDataImg2} />
              </View>
            </ScrollView>
          )}
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={
            dateCheck
              ? data => pickADate(data, 'From')
              : data => pickADate(data, 'To')
          }
          onCancel={hideDatePicker}
        />
        {userList.length > 1 && (
          <View style={Styles.currentUserView}>
            <AppText
              children={user.FirstName + ' ' + user.LastName + ' '}
              style={{color: COLORS.white}}
            />
          </View>
        )}
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default Attendance;
