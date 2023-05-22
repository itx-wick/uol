import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Image, View, RefreshControl, Dimensions} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {useDispatch, useSelector} from 'react-redux';
import {Screen, AppText} from '../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../constants';
import {logout} from '../../redux/auth/authSlice';
import {setMonthlyTimetableList} from '../../redux/tabs/tabSlice';
import {postApiCall} from '../../services/ApiServices';
import {Styles} from '../../styles';
import {Commons} from '../../utils';
const {width, height} = Dimensions.get('window');

const MonthlyTimetable = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const monthlyList = useSelector(state => state.Tab.monthlyTimetableList);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);
  const [markedDate, setMarkedDate] = useState();
  const [filteredDate, setFilteredDate] = useState(
    moment(Date.now()).utc().format('yyyy-MM-DD'),
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getSelectedDayEvents(filteredDate);
  }, [filteredDate]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getTimetable();
    });
    return unsubscribe;
  }, [navigation]);

  const getTimetable = () => {
    setRefreshing(true);
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      RequiredDate: filteredDate,
    };
    let endPoint =
      data.Type === 'T' ? END_POINT.T_TIMETABLE : END_POINT.U_TIMETABLE;
    postApiCall(endPoint, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setMonthlyTimetableList(res.Data.Timetables));
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

  const onRefresh = () => {
    getTimetable();
  };

  const ListItem = data => {
    var hour = data.item.Duration.split(':')[0];
    const minute = data.item.Duration.substring(
      data.item.Duration.indexOf(':') + 1,
    );
    let duration = `${hour} Hour ${minute} Minutes`;
    return (
      <View>
        <View style={Styles.timetable_list_item_card}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                width: width * 0.65,
              }}>
              <AppText
                children={`${data.item.Subject}${
                  data.item.LectureType ? ' - ' + data.item.LectureType : ''
                }`}
                numberOfLines={1}
                style={{
                  fontWeight: 'bold',
                  fontSize: RFValue(16),
                  color: COLORS.black,
                }}
              />
            </View>
            <AppText
              children={data.item.Venue}
              numberOfLines={1}
              style={{
                fontSize: RFValue(13),
                width: width * 0.6,
                color: COLORS.black,
              }}
            />
            <AppText
              children={duration}
              style={{fontSize: RFValue(13), color: COLORS.black}}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              position: 'absolute',
              right: 5,
            }}>
            <AppText
              children={moment(data.item.StartTime).format('hh')}
              style={{
                fontSize: RFValue(36),
                fontWeight: 'bold',
                color: COLORS.primary,
              }}
            />
            <View>
              <AppText
                children={':' + moment(data.item.StartTime).format('mm')}
                style={{fontSize: RFValue(12), color: COLORS.primary}}
              />
              <AppText
                children={moment(data.item.StartTime).format('A')}
                style={{fontSize: RFValue(12), color: COLORS.primary}}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getSelectedDayEvents = date => {
    let markedDates = {};
    markedDates[date] = {
      selected: true,
      color: '#00B0BF',
      textColor: '#FFFFFF',
    };
    getTimetable();
    setMarkedDate(markedDates);
  };

  return (
    <>
      <Screen>
        <Calendar
          markedDates={markedDate}
          onDayPress={day => {
            setFilteredDate(day.dateString);
            getSelectedDayEvents(day.dateString);
          }}
          horizontal={true}
          showScrollIndicator={true}
          monthFormat={'MMMM yyyy'}
          enableSwipeMonths={true}
          minDate={'1996-05-10'}
          maxDate={'2030-05-30'}
          markingType={'multi-dot'}
          theme={{
            textSectionTitleColor: COLORS.gray,
            textSectionTitleDisabledColor: COLORS.gray,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.black,
            textDisabledColor: COLORS.gray,
            dotColor: COLORS.primary,
            selectedDotColor: '#ffffff',
            arrowColor: 'black',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: 'black',
            indicatorColor: 'blue',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
          style={{
            marginHorizontal: RFValue(5),
            marginVertical: RFValue(5),
          }}
        />

        <View style={Styles.timetable_main_cont}>
          {monthlyList.length > 0 ? (
            <FlatList
              data={monthlyList}
              renderItem={({item}) => <ListItem item={item} />}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListFooterComponent={<View style={{height: RFValue(240)}} />}
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
                <Image source={IMAGES.noData} style={Styles.noDataImg3} />
              </View>
            </ScrollView>
          )}
        </View>
        {userList.length > 1 && (
          <View style={Styles.currentUserView}>
            <AppText
              children={user.FirstName + ' ' + user.LastName + ' '}
              style={{color: COLORS.white}}
            />
          </View>
        )}
      </Screen>
    </>
  );
};

export default MonthlyTimetable;
