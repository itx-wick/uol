import React, {useEffect} from 'react';
import {
  View,
  Image,
  RefreshControl,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {
  Screen,
  Header,
  Loader,
  AppText,
  NotificationsList,
  Icon,
} from '../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../constants';
import {FloatingBtnActions} from '../../data';
import {logout} from '../../redux/auth/authSlice';
import {postApiCall} from '../../services/ApiServices';
import {Styles} from '../../styles';
import {Commons} from '../../utils';
import {RFValue} from 'react-native-responsive-fontsize';
import moment from 'moment';
import {setNotificationsList} from '../../redux/tabs/tabSlice';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

function Notifications(props) {
  const dispatch = useDispatch();
  const notificationsList = useSelector(state => state.Tab.notificationsList);
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);
  const [refreshing, setRefreshing] = React.useState(false);

  // useEffect(() => {
  //   const unsubscribe = props.navigation.addListener('focus', () => {
  //     getNotifications();
  //   });
  //   return unsubscribe;
  // }, [props.navigation]);

  useEffect(() => {
    getNotifications();
  }, []);

  const onRefresh = () => {
    getNotifications();
  };

  const getNotifications = () => {
    setRefreshing(true);
    let data =
      userType === 'T'
        ? {
            ID: user.ID,
            APIAccessToken: user.APIAccessToken,
            Type: userType,
            UpdatedOn: user.UpdatedOn,
            Timestamp: Date.now(),
          }
        : {
            ID: user.ID,
            APIAccessToken: user.APIAccessToken,
            Type: userType,
            Timestamp: Date.now(),
          };
    let endPoint =
      data.Type === 'T' ? END_POINT.T_NOTIFICATIONS : END_POINT.U_NOTIFICATIONS;

    postApiCall(endPoint, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          console.log(Object.keys(res.Data).length);
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            const uniqueArray = res.Data.Notifications.filter(
              (obj, index, self) =>
                index === self.findIndex(o => o.ID === obj.ID),
            );
            dispatch(setNotificationsList(uniqueArray));
            // const uniqueData = res.Data.Notifications.filter(element => {
            //   const isDuplicate = notificationsList.includes(element.ID);
            //   if (!isDuplicate) {
            //     notificationsList.push(element.ID);
            //     return true;
            //   }
            //   return false;
            // });
            console.log('Unique Data', JSON.stringify(uniqueArray, null, 2));
            // dispatch(setNotificationsList(uniqueData));
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

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Notifications'}
          showBackButton={false}
          showDrawerBtn={true}
          onDrawerPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <View style={Styles.announcement_main_cont}>
          {notificationsList.length > 0 ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={notificationsList}
              keyExtractor={({itm, index}) => index}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => {
                    Commons.navigateParams(
                      props.navigation,
                      ROUTES.NOTIFICATION_DETAILS,
                      {
                        details: item,
                      },
                    );
                  }}>
                  <View
                    style={{
                      width: width * 0.95,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: RFValue(10),
                      marginVertical: RFValue(4),
                      borderRadius: RFValue(3),
                      backgroundColor: COLORS.white,
                      borderLeftWidth: RFValue(5),
                      borderLeftColor: COLORS.primary,
                      marginTop: index === 0 ? RFValue(5) : RFValue(0),
                    }}>
                    <View>
                      <AppText
                        children={item.Title}
                        numberOfLines={1}
                        style={{
                          fontWeight: 'bold',
                          color: COLORS.black,
                          width: width * 0.75,
                        }}
                      />
                      <AppText
                        children={moment(item.CreatedOn)
                          .utc()
                          .format('DD MMM yyyy HH:mm')}
                        style={{color: COLORS.black}}
                      />
                    </View>
                    <Icon
                      iconType={'materialCommunity'}
                      icon="chevron-right"
                      iconSize={30}
                      iconColor={COLORS.black}
                      onClick={() => {
                        Commons.navigateParams(
                          instance.navigation,
                          ROUTES.NOTIFICATION_DETAILS,
                          {
                            details: item,
                          },
                        );
                      }}
                    />
                  </View>
                </TouchableOpacity>
              )}
              refreshControl={
                <RefreshControl
                  //refresh control used for the Pull to Refresh
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              ListFooterComponent={<View style={{height: RFValue(60)}} />}
            />
          ) : (
            // <NotificationsList
            //   data={notificationsList}
            //   refreshing={refreshing}
            //   onRefresh={onRefresh}
            //   instance={props}
            // />
            <ScrollView
              showsVerticalScrollIndicator={false}
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
        {userType == 'T' && user.NotificationRights == 0 && (
          <FloatingAction
            actions={FloatingBtnActions}
            color={COLORS.primary}
            onPressItem={name => {
              if (name === 'bt_create') {
                Commons.navigate(props.navigation, ROUTES.CREATE_NOTIFICATION);
              }
            }}
          />
        )}
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default Notifications;
