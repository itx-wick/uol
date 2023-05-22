import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import {
  AnnouncementDetails,
  Login,
  NotificationDetails,
  OnBoarding,
  Splash,
} from '../screens';

import {COLORS, ROUTES} from '../constants';
import DrawerNavigator from './DrawerNavigator';
import {postApiCall} from '../services/ApiServices';
import {Commons} from '../utils';
import {logout} from '../redux/auth/authSlice';
import {setNotificationsList} from '../redux/tabs/tabSlice';
import {setEvents} from '../redux/drawer/drawerSlice';

function StackNavigation() {
  const Stack = createStackNavigator();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.User.isLoggedIn);
  const userObj = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Remote Notification Get Initial',
            JSON.stringify(remoteMessage.data, null, 2),
          );
          const objCheck = Object.keys(userObj).length === 0;
          let json = JSON.parse(remoteMessage.data.custom_data);
          switch (remoteMessage.data.type) {
            case '1':
              // code block
              break;
            case '2':
              // code block
              break;
            case '3':
              // Notifications
              if (isLoggedIn && !objCheck) {
                if (userType === 'T') {
                  navigation.navigate(ROUTES.D_HOME, {
                    screen: ROUTES.B_HOME,
                    params: {
                      screen: ROUTES.NOTIFICATIONS,
                    },
                  });
                } else {
                  getNotifications(json.notification_id);
                }
              }
              break;
            case '4':
              // Events
              if (isLoggedIn && !objCheck) {
                if (userType === 'T') {
                  navigation.navigate(ROUTES.ANNOUNCEMENT);
                } else {
                  getEvents(json.id);
                }
              }
              break;
            default:
            // code block
          }
        }
      });

    var onMessage = messaging().onMessage(async remoteMessage => {
      console.log(
        'Remote Notification On Message',
        JSON.stringify(remoteMessage.data, null, 2),
      );
    });

    var onNotificationOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage) {
          console.log(
            'On Notification Opened App',
            JSON.stringify(remoteMessage.data, null, 2),
          );
          const objCheck = Object.keys(userObj).length === 0;
          let json = JSON.parse(remoteMessage.data.custom_data);
          switch (remoteMessage.data.type) {
            case '1':
              // code block
              break;
            case '2':
              // code block
              break;
            case '3':
              //Notifications
              console.log(
                'On Notification Opened',
                isLoggedIn,
                !objCheck,
                json.notification_id,
              );
              if (isLoggedIn && !objCheck) {
                if (userType === 'T') {
                  navigation.navigate(ROUTES.D_HOME, {
                    screen: ROUTES.B_HOME,
                    params: {
                      screen: ROUTES.NOTIFICATIONS,
                    },
                  });
                } else {
                  getNotifications(json.notification_id);
                }
              }
              break;
            case '4':
              //Events
              if (isLoggedIn && !objCheck) {
                if (userType === 'T') {
                  navigation.navigate(ROUTES.ANNOUNCEMENT);
                } else {
                  getEvents(json.id);
                }
              }
              break;
            default:
            // code block
          }
        }
      },
    );

    return () => {
      onMessage();
      onNotificationOpenedApp();
    };
  }, []);

  const getNotifications = id => {
    let data =
      userType === 'T'
        ? {
            ID: userObj.ID,
            APIAccessToken: userObj.APIAccessToken,
            Type: userType,
            UpdatedOn: userObj.UpdatedOn,
            Timestamp: Date.now(),
          }
        : {
            ID: userObj.ID,
            APIAccessToken: userObj.APIAccessToken,
            Type: userType,
            Timestamp: Date.now(),
          };
    let endPoint =
      data.Type === 'T'
        ? 'teacher/notifications/notifications_list_v1'
        : 'notifications/notifications_list';
    postApiCall(endPoint, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setNotificationsList(res.Data.Notifications));
            const filteredResult = res.Data.Notifications.find(
              obj => obj.ID === id,
            );
            navigation.navigate(ROUTES.D_HOME, {
              screen: ROUTES.B_HOME,
              params: {
                screen: ROUTES.NOTIFICATIONS,
                params: {
                  screen: ROUTES.NOTIFICATION_DETAILS,
                  params: {
                    details: filteredResult,
                  },
                },
              },
            });
            console.log('CheckFilteredNotification', filteredResult);
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
      })
      .catch(err => {
        console.warn(err);
      });
  };

  const getEvents = id => {
    let data = {
      ID: userObj.ID,
      APIAccessToken: userObj.APIAccessToken,
      Type: userType,
    };
    let endPoint =
      data.Type === 'T' ? 'teacher/events/events_list' : 'events/events_list';
    postApiCall(endPoint, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setEvents(res.Data.Events));
            const filteredResult = res.Data.Events.find(obj => obj.ID === id);
            navigation.navigate(ROUTES.ANNOUNCEMENT_DETAILS, {
              details: filteredResult,
            });
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
      })
      .catch(err => {
        console.warn(err);
      });
  };

  return (
    <Stack.Navigator initialRouteName={ROUTES.ON_BOARDING}>
      <Stack.Screen
        name={ROUTES.ON_BOARDING}
        component={OnBoarding}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.D_HOME}
        component={DrawerNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.ANNOUNCEMENT_DETAILS}
        component={AnnouncementDetails}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.NOTIFICATION_DETAILS}
        component={NotificationDetails}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default StackNavigation;
