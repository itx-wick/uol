import {
  Alert,
  BackHandler,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import { CommonActions } from '@react-navigation/native';
import ImageResizer from 'react-native-image-resizer';
import DocumentPicker from 'react-native-document-picker';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { showMessage } from 'react-native-flash-message';

export default {
  imageResizer: obj => {
    return new Promise((resolve, reject) => {
      ImageResizer.createResizedImage(obj, 600, 600, 'JPEG', 100, 0)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  isValidUrl: string => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
      return false;
    }
  },

  isImage: url => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  },

  getInitials: string => {
    var names = string.split(' '),
      initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  },

  pickSingleFile: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const results = await DocumentPicker.pickSingle({
          type: DocumentPicker.types.allFiles,
          copyTo: 'cachesDirectory',
        });
        resolve(results);
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
        } else {
          throw err;
        }
        reject(err);
      }
    });
  },

  reqCamraPermissions: () => {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    )
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            // console.log('This feature is not available (on this device / in this context)');
            Linking.openURL('app-settings:');
            break;
          case RESULTS.DENIED:
            // console.log('The permission has not been requested / is denied but requestable');
            request(
              Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA,
            ).then(result => { });
            break;
          case RESULTS.LIMITED:
            // console.log('The permission is limited: some actions are possible');
            Linking.openURL('app-settings:');
            break;
          case RESULTS.GRANTED:
            // console.log('The permission is granted');
            break;
          case RESULTS.BLOCKED:
            // console.log('The permission is denied and not requestable anymore');
            Linking.openURL('app-settings:');
            break;
        }
      })
      .catch(error => {
        // …
      });
  },
  requestCameraPermission: () => {
    return new Promise(async (resolve, reject) => {
      try {
        PERMISSIONS.requestPermission('camera').then(response => {
          let granted = false;
          if (response === 'authorized') {
            granted = true;
          }
          // response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
          if (granted) {
            resolve(true);
          } else {
            console.log('Permission denied');
            this.requestCameraPermission();
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  checkPermissions: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Camera Permission',
            message:
              'LMDC needs access to your camera ' + 'so you can take pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted) {
          resolve(true);
        } else {
          console.log('Permission denied');
          reject('Permission denied');
        }
      } catch (err) {
        console.warn(err);
        reject(err);
      }
    });
  },

  calculateDateFromObj: date => {
    let strDate =
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
      '-' +
      (date.getMonth() > 8
        ? date.getMonth() + 1
        : '0' + (date.getMonth() + 1)) +
      '-' +
      date.getFullYear();
    return strDate || date;
  },

  subtractMonths: (date, months) => {
    date.setMonth(date.getMonth() - months);
    return date;
  },

  subjectsArray: array => {
    const newArray = array.map(({ ID: id, Name: item, ...rest }) => ({
      id,
      item,
      ...rest,
    }));
    const finalArray = newArray.map(val => ({
      ...val,
      item: `${val.item} - ${val.Class}`, // just for example
    }));
    return finalArray;
  },

  venuesArray: array => {
    const newArray = array.map(({ VenueID: id, VenueName: item, ...rest }) => ({
      id,
      item,
      ...rest,
    }));
    return newArray;
  },

  testArray: array => {
    const newArray = array.map(
      ({ ExamTypeID: id, ExamTypeName: item, ...rest }) => ({
        id,
        item,
        ...rest,
      }),
    );
    return newArray;
  },

  LectureArray: array => {
    const newArray = array.map(
      ({ LectureTypeID: id, LectureName: item, ...rest }) => ({
        id,
        item,
        ...rest,
      }),
    );
    return newArray;
  },

  batchArray: array => {
    const newArray = array.map(({ BatchID: id, BatchName: item, ...rest }) => ({
      id,
      item,
      ...rest,
    }));
    let finalArray = newArray;
    finalArray.forEach(object => {
      object.isSelected = false;
    });
    return finalArray;
  },

  coTeacherArray: array => {
    const arr = array.map(({ ID: id, FirstName: item, ...rest }) => ({
      id,
      item,
      ...rest,
    }));
    const newArray = arr.map(val => ({
      ...val,
      item: `${val.item} ${val.LastName}`, // just for example
    }));
    let finalArray = newArray;
    finalArray.forEach(object => {
      object.isSelected = false;
    });
    return finalArray;
  },

  notificationSubArray: array => {
    const arr = array.map(({ ID: id, Name: item, ...rest }) => ({
      id,
      item,
      ...rest,
    }));
    console.log(arr);
    const newArray = arr.map(val => ({
      ...val,
      item: `${val.NAME} - ${val.Class}`, // just for example
    }));
    let finalArray = newArray;
    finalArray.forEach(object => {
      object.isSelected = false;
    });
    return finalArray;
  },

  callNumber: phone => {
    console.log('callNumber ----> ', phone);
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
      phoneNumber = `telprompt:${phone}`;
    } else {
      phoneNumber = `tel:${phone}`;
    }
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          Alert.alert('Phone number is not available');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(err => console.log(err));
  },

  openMap: async (lat, lng) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const link = Platform.select({
      ios: `${scheme}@${latLng}`,
      android: `${scheme}${latLng}`,
    });

    try {
      Linking.openURL(link);
    } catch (error) {
      console.log(error);
    }
  },

  snackBar: (msg, bgColor) => {
    Snackbar.show({
      text: msg,
      duration: Snackbar.LENGTH_INDEFINITE,
      textColor: '#fff',
      numberOfLines: 2,
      backgroundColor: bgColor,
      action: {
        text: 'Hide',
        textColor: '#fff',
        onPress: () => {
          Snackbar.dismiss();
        },
      },
    });
  },

  mailTo: mail => {
    Linking.openURL(`mailto:${mail}`);
  },

  openURL: url => {
    Linking.openURL(url);
  },

  reset: (navigation, screen) => {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: screen }],
    });

    navigation.dispatch(resetAction);
  },

  navigateParams: (navigation, screen, params) => {
    navigation.navigate(screen, params);
  },

  navigate: (navigation, screen) => {
    navigation.navigate(screen);
  },

  exitApp: () => {
    BackHandler.exitApp();
    return true;
  },

  goBack: navigation => {
    navigation.goBack(null);
    return true;
  },

  showError: message => {
    showMessage({
      type: 'danger',
      icon: 'danger',
      message,
    });
  },

  showSuccess: message => {
    showMessage({
      type: 'success',
      icon: 'success',
      message,
    });
  },

  otpTimeCounter: seconds => {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return `${m}:${s}`;
  },

  getWords: (sentence, w) => {
    // Split the sentence into an array of words
    var words = sentence.split(" ");
    // Retrieve the first two words
    var firstTwoWords = words.slice(0, w);
    // Join the first two words back into a string
    var result = firstTwoWords.join(" ");

    // Return the result
    return result;
  }
};
