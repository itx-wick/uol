import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {View, RefreshControl, Image, Dimensions} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {useDispatch, useSelector} from 'react-redux';
import {Screen, AppText} from '../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../constants';
import {logout} from '../../redux/auth/authSlice';
import {setWeeklyTimetableList} from '../../redux/tabs/tabSlice';
import {postApiCall} from '../../services/ApiServices';
import {Styles} from '../../styles';
import {Commons} from '../../utils';
const {width, height} = Dimensions.get('window');

function WeeklyTimetable(props) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const weeklyList = useSelector(state => state.Tab.weeklyTimetableList);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredDate, setFilteredDate] = useState(Date.now());

  useEffect(() => {
    getTimetable();
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
      RequiredDate: moment(filteredDate).utc().format('yyyy-MM-DD'),
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
            dispatch(setWeeklyTimetableList(res.Data.Timetables));
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.danger);
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
      <TouchableOpacity onPress={() => {}}>
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
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Screen>
        <CalendarStrip
          calendarAnimation={{type: 'sequence', duration: 30}}
          style={{height: 100, paddingTop: 20, paddingBottom: 10, marginTop: 2}}
          calendarHeaderStyle={{color: 'white'}}
          calendarColor={'#444'}
          dateNumberStyle={{color: 'white'}}
          dateNameStyle={{color: 'white'}}
          highlightDateNumberStyle={{color: COLORS.primary}}
          highlightDateNameStyle={{color: COLORS.white}}
          iconLeftStyle={{tintColor: COLORS.white}}
          iconRightStyle={{tintColor: COLORS.white}}
          iconContainer={{flex: 0.1}}
          selectedDate={moment(Date.now())}
          onDateSelected={date => {
            setFilteredDate(date);
          }}
        />
        <View style={Styles.timetable_main_cont}>
          {weeklyList.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                alignItems: 'center',
              }}
              data={weeklyList}
              renderItem={({item}) => <ListItem item={item} />}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListFooterComponent={<View style={{height: RFValue(110)}} />}
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
}

export default WeeklyTimetable;
