import React, {useState, useEffect} from 'react';
import {View, Image, RefreshControl, Button} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useDispatch, useSelector} from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import {Screen, Header, AppText, Loader} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {Styles} from '../../../styles';
import {postApiCall} from '../../../services/ApiServices';
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {Commons} from '../../../utils';
import {logout, setCurrentUser} from '../../../redux/auth/authSlice';
import {setHomeDashStat} from '../../../redux/tabs/tabSlice';
import moment from 'moment';
function Home(props) {
  const dispatch = useDispatch();
  const dashStat = useSelector(state => state.Tab.dashStat);
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userList = useSelector(state => state.Common.usersList);
  const userType = useSelector(state => state.Common.userType);

  const [refreshing, setRefreshing] = useState(false);
  let row = [];
  let prevOpenedRow;

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
      UpdatedOn: user.UpdatedOn,
    };
    postApiCall(END_POINT.U_DASHBOARD, data)
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
        console.log(err);
        setRefreshing(false);
      });
  };

  const renderItem = ({item, index}, onClick) => {
    //
    const closeRow = index => {
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };

    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <View
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: RFValue(80),
          }}>
          <Button color="red" onPress={onClick} title="DELETE"></Button>
        </View>
      );
    };
    return (
      <>
        {userType === 'F' || userType === 'M' || userType === 'G' ? (
          <Swipeable
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, onClick)
            }
            onSwipeableOpen={() => closeRow(index)}
            ref={ref => (row[index] = ref)}
            rightOpenValue={-120}>
            <TouchableOpacity
              onPress={() => {
                dispatch(setCurrentUser(item));
              }}>
              <View style={Styles.homeDashCardView}>
                <View style={Styles.userDashMainView}>
                  <>
                    {item.ProfilePic && item.ProfilePic !== '' ? (
                      <Image
                        source={{uri: item.ProfilePic}}
                        style={Styles.userImage}
                      />
                    ) : (
                      <View style={Styles.userInitials}>
                        <AppText style={Styles.userInitialsText}>
                          {Commons.getInitials(
                            item.FirstName + ' ' + item.LastName,
                          )}
                        </AppText>
                      </View>
                    )}
                  </>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                      }}>
                      <AppText
                        children={`${
                          item.FirstName != undefined ||
                          item.FirstName != null ||
                          item.FirstName != ''
                            ? item.FirstName + ' '
                            : ''
                        }${
                          item.LastName !== undefined ||
                          item.LastName !== null ||
                          item.LastName !== ''
                            ? item.LastName
                            : ''
                        }`}
                        numberOfLines={1}
                        style={[Styles.nameDash, {width: '60%'}]}
                      />
                      <View
                        style={{
                          width: '30%',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          // paddingRight: 25,
                        }}>
                        <AppText
                          children={item.RollNo}
                          numberOfLines={1}
                          style={Styles.nameDash}
                        />
                      </View>
                    </View>
                    <AppText
                      children={
                        item.Year !== undefined ||
                        item.Year !== null ||
                        item.Year !== ''
                          ? item.Year
                          : 'N/A'
                      }
                      numberOfLines={1}
                      style={{
                        fontSize: RFValue(12),
                      }}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Swipeable>
        ) : (
          <TouchableOpacity
            onPress={() => {
              dispatch(setCurrentUser(item));
            }}>
            <View style={Styles.homeDashCardView}>
              <View style={Styles.userDashMainView}>
                <>
                  {item.ProfilePic && item.ProfilePic !== '' ? (
                    <Image
                      source={{uri: item.ProfilePic}}
                      style={Styles.userImage}
                    />
                  ) : (
                    <View style={Styles.userInitials}>
                      <AppText style={Styles.userInitialsText}>
                        {Commons.getInitials(
                          item.FirstName + ' ' + item.LastName,
                        )}
                      </AppText>
                    </View>
                  )}
                </>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                    }}>
                    <AppText
                      children={`${
                        item.FirstName != undefined ||
                        item.FirstName != null ||
                        item.FirstName != ''
                          ? item.FirstName + ' '
                          : ''
                      }${
                        item.LastName !== undefined ||
                        item.LastName !== null ||
                        item.LastName !== ''
                          ? item.LastName
                          : ''
                      }`}
                      numberOfLines={1}
                      style={[Styles.nameDash, {width: '60%'}]}
                    />
                    <View
                      style={{
                        width: '30%',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        // paddingRight: 25,
                      }}>
                      <AppText
                        children={item.RollNo}
                        numberOfLines={1}
                        style={Styles.nameDash}
                      />
                    </View>
                  </View>
                  <AppText
                    children={
                      item.Year !== undefined ||
                      item.Year !== null ||
                      item.Year !== ''
                        ? item.Year
                        : 'N/A'
                    }
                    numberOfLines={1}
                    style={{
                      fontSize: RFValue(12),
                      color: COLORS.black,
                    }}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const deleteItem = ({item, index}) => {
    let a = userList;
    a.splice(index, 1);
    console.log(a);
    setUsersList([...a]);
    if (userList.length === 0) {
      dispatch(logout());
      Commons.reset(props.navigation, ROUTES.LOGIN);
    } else {
      Commons.reset(props.navigation, ROUTES.HOME);
      dispatch(setCurrentUser(userList[0]));
    }
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
            <FlatList
              data={userList}
              renderItem={v =>
                renderItem(v, () => {
                  deleteItem(v);
                })
              }
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
            />
            <View style={Styles.homeStatViewCont}>
              <TouchableOpacity
                style={Styles.statItemView}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.TESTS);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.primary}]}>
                  <AppText
                    children={
                      dashStat.OverallTestPercent === undefined ||
                      dashStat.OverallTestPercent === null ||
                      dashStat.OverallTestPercent === 'N/A'
                        ? '0%'
                        : dashStat.OverallTestPercent
                    }
                    style={[Styles.statItemText, {color: COLORS.primary}]}
                  />
                </View>
                <AppText
                  children={'Overall Test %'}
                  style={{marginTop: RFValue(10)}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.statItemView}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.ATTENDANCE);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.green}]}>
                  <AppText
                    children={
                      dashStat.OverallPresentPercent === undefined ||
                      dashStat.OverallPresentPercent === null ||
                      dashStat.OverallPresentPercent === 'N/A'
                        ? '0%'
                        : dashStat.OverallPresentPercent
                    }
                    style={[Styles.statItemText, {color: COLORS.green}]}
                  />
                </View>
                <AppText
                  children={'Overall Present %'}
                  style={{marginTop: RFValue(10)}}
                />
              </TouchableOpacity>
            </View>
            <View style={Styles.homeStatViewCont}>
              <TouchableOpacity
                style={Styles.statItemView}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.TIMETABLE);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.blue}]}>
                  <AppText
                    children={
                      dashStat.TodayLectureCount === undefined ||
                      dashStat.TodayLectureCount === null ||
                      dashStat.TodayLectureCount === 'N/A'
                        ? '0'
                        : dashStat.TodayLectureCount
                    }
                    style={[Styles.statItemText, {color: COLORS.blue}]}
                  />
                </View>

                <AppText
                  children={'Todays Lecture'}
                  style={{marginTop: RFValue(10)}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.statItemView}
                onPress={() => {
                  Commons.navigate(props.navigation, ROUTES.ANNOUNCEMENT);
                }}>
                <View style={[Styles.statItem, {borderColor: COLORS.blue}]}>
                  <AppText
                    children={
                      dashStat.EventCount === undefined ||
                      dashStat.EventCount === null ||
                      dashStat.EventCount === 'N/A'
                        ? '0%'
                        : dashStat.EventCount
                    }
                    style={[Styles.statItemText, {color: COLORS.blue}]}
                  />
                </View>
                <AppText
                  children={'Announcements'}
                  style={{marginTop: RFValue(10)}}
                />
              </TouchableOpacity>
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

export default Home;
