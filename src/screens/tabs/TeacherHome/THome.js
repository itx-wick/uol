import React, {useState, useEffect} from 'react';
import {View, Image, Pressable, Dimensions, RefreshControl} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useDispatch, useSelector} from 'react-redux';

import {Screen, Header, AppText, Loader} from '../../../components';
import {
  setAttendanceTeachers,
  setHomeDashStat,
  setStudentsList,
  setTeacherAttendanceSchedule,
} from '../../../redux/tabs/tabSlice';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {Styles} from '../../../styles';
import {postApiCall} from '../../../services/ApiServices';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Commons} from '../../../utils';
import {logout} from '../../../redux/auth/authSlice';
import {setLoader} from '../../../redux/common/commonSlice';
const {width} = Dimensions.get('window');
function THome(props) {
  const dispatch = useDispatch();
  const dashStat = useSelector(state => state.Tab.dashStat);
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userList = useSelector(state => state.Common.usersList);
  const userType = useSelector(state => state.Common.userType);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getDashboardStat();
  }, [user]);

  const onRefresh = () => {
    getDashboardStat();
  };

  const getDashboardStat = () => {
    console.log('Current User: ', JSON.stringify(user, null, 2));
    setRefreshing(true);
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
    };
    postApiCall(END_POINT.T_DASHBOARD, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setHomeDashStat(res.Data));
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

  const getStudents = id => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: id,
    };
    postApiCall(END_POINT.GET_STUDENTS_VENUES, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            let teachers = Commons.coTeacherArray(res.Data.CoTeachers);
            dispatch(setAttendanceTeachers(teachers));
            const stdRes = res.Data.Students;
            for (var i = 0; i < stdRes.length; i++) {
              let arr = stdRes;
              arr.forEach(object => {
                object.Status = '1';
              });
              dispatch(setStudentsList(arr));
            }
            props.navigation.navigate(ROUTES.T_ATTENDANCE, {
              screen: ROUTES.MARK_S_ATTENDANCE,
            });
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

  const ListItem = data => {
    return (
      <Pressable
        onPress={() => {
          {
            user.AddAttendance == 1 && getStudents(data.item.SubjectID);
            dispatch(setTeacherAttendanceSchedule(data.item));
          }
        }}>
        <View>
          <View
            style={[Styles.announcement_list_item_card, {width: width * 0.9}]}>
            <View>
              <AppText
                children={data.item.SubjectName}
                style={{
                  fontWeight: 'bold',
                  fontSize: RFValue(16),
                  color: COLORS.black,
                }}
              />
              <View style={{flexDirection: 'row'}}>
                <AppText
                  children={data.item.StartTime}
                  style={{fontSize: RFValue(12), color: COLORS.black}}
                />
                <AppText
                  children={' - ' + data.item.EndTime}
                  style={{fontSize: RFValue(12), color: COLORS.black}}
                />
              </View>
            </View>
            <Image
              source={IMAGES.take_attendance}
              style={{
                width: RFValue(24),
                height: RFValue(24),
                tintColor: COLORS.primary,
                marginHorizontal: RFValue(5),
              }}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <Screen style={{backgroundColor: COLORS.whiteSmoke}}>
        <Header
          navigation={props.navigation}
          title={'Home'}
          showBackButton={false}
          showDrawerBtn={true}
          onDrawerPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <ScrollView
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }>
          <View style={Styles.homeMainCont}>
            <View style={Styles.homeStatViewCont}>
              <Pressable
                style={Styles.homeStatBox}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.ATTENDANCE);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.primary}]}>
                  <AppText
                    children={
                      dashStat.LecturesDelivered !== undefined ||
                      dashStat.LecturesDelivered !== null ||
                      dashStat.LecturesDelivered !== 'N/A'
                        ? dashStat.LecturesDelivered
                        : '0%'
                    }
                    style={[Styles.statItemText, {color: COLORS.primary}]}
                  />
                </View>
                <AppText
                  children={'Lectures Delivered'}
                  style={{marginTop: RFValue(10)}}
                />
              </Pressable>
              <Pressable
                style={Styles.homeStatBox}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.TESTS);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.primary}]}>
                  <AppText
                    children={
                      dashStat.ExamsConducted === undefined ||
                      dashStat.ExamsConducted === null ||
                      dashStat.ExamsConducted === 'N/A'
                        ? '0%'
                        : dashStat.ExamsConducted
                    }
                    style={[Styles.statItemText, {color: COLORS.primary}]}
                  />
                </View>
                <AppText
                  children={'Test Conducted'}
                  style={{marginTop: RFValue(10)}}
                />
              </Pressable>
            </View>
            <View style={Styles.homeStatViewCont}>
              <Pressable
                style={Styles.homeStatBox}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.TIMETABLE);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.primary}]}>
                  <AppText
                    children={
                      dashStat.TodayLectureCount === undefined ||
                      dashStat.TodayLectureCount === null ||
                      dashStat.TodayLectureCount === 'N/A'
                        ? '0'
                        : dashStat.TodayLectureCount
                    }
                    style={[Styles.statItemText, {color: COLORS.primary}]}
                  />
                </View>
                <AppText
                  children={'Todays Lecture'}
                  style={{marginTop: RFValue(10)}}
                />
              </Pressable>
              <Pressable
                style={Styles.homeStatBox}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.ANNOUNCEMENT);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.primary}]}>
                  <AppText
                    children={
                      dashStat.EventCount === undefined ||
                      dashStat.EventCount === null ||
                      dashStat.EventCount === 'N/A'
                        ? '0%'
                        : dashStat.EventCount
                    }
                    style={[Styles.statItemText, {color: COLORS.primary}]}
                  />
                </View>
                <AppText
                  children={'Announcements'}
                  style={{marginTop: RFValue(10)}}
                />
              </Pressable>
            </View>
            <View style={Styles.take_attendance_dashboard}>
              <FlatList
                data={dashStat.Lectures}
                renderItem={({item}) => <ListItem item={item} />}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                style={Styles.announcement_list}
                contentContainerStyle={Styles.announcement_list_container}
              />
            </View>
          </View>
        </ScrollView>

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

export default THome;
