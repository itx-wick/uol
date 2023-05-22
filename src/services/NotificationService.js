import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Commons} from '../utils';
import {Alert, Platform} from 'react-native';

const registerAppWithFCM = async () => {
  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
    await messaging().setAutoInitEnabled(true);
  }
};

export const checkNotificationPermission = async () => {
  const enabled = firebase.messaging().hasPermission();
  if (enabled) {
    console.log('Its getting FCM here');
    getToken();
  } else {
    console.log('Its getting FCM permission here');
    requestNotificationPermission();
  }
};

const getToken = async () => {
  await messaging().registerDeviceForRemoteMessages();
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  if (!fcmToken) {
    messaging()
      .getToken()
      .then(async fcmToken => {
        if (fcmToken) {
          await AsyncStorage.setItem('fcmToken', fcmToken);
        } else {
          await AsyncStorage.setItem('fcmToken', '1234');
          // console.log("[FCMService] User does not have a device token")
        }
      })
      .catch(async error => {
        let err = `FCm token get error${error}`;
        await AsyncStorage.setItem('fcmToken', '1234');
        console.log('[FCMService] getToken rejected ', err);
      });
  }
  // let fcmToken = await AsyncStorage.getItem('fcmToken');
  // if (!fcmToken) {
  //   fcmToken = await firebase.messaging().getToken();
  //   if (fcmToken) {
  //     //User has a device token
  //     await AsyncStorage.setItem('fcmToken', fcmToken);
  //   }
  // }
  console.log('FCM Token', fcmToken);
};

const requestNotificationPermission = async () => {
  try {
    //User has authorized
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      getToken();
    }
  } catch (error) {
    //User has rejected permissions
    Commons.showError(error.message);
    console.log('Permission Rejected');
  }
};
