import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';

import {Platform} from 'react-native';

const PLATFORM_CAMERA_PERMISSIONS = {
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
};

const REQUEST_PERMISSION_TYPE = {
  camera: PLATFORM_CAMERA_PERMISSIONS,
};

const PERMISSION_TYPE = {
  camera: 'camera',
};

class AppPermission {
  checkPermission = async type => {
    console.log('AppPermission checkPermission type: ', type);
    const permissions = REQUEST_PERMISSION_TYPE[type][Platform.OS];
    console.log('AppPermission checkPermission permissions: ', permissions);
    if (!permissions) {
      return true;
    }
    try {
      const result = await check(permissions);
      console.log('AppPermission checkPermission result: ', result);
      if (result === RESULTS.GRANTED) return true;
      return this.requestPermission(permissions);
    } catch (error) {
      console.log('AppPermission checkPermission error: ', error);
      return false;
    }
  };

  requestPermission = async permissions => {
    console.log('AppPermission requestPermission permissions: ', permissions);
    try {
      const result = await request(permissions);
      console.log('AppPermission requestPermission result: ', result);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.log('AppPermission requestPermission error: ', error);
      return false;
    }
  };
}

const Permission = new AppPermission();
export {Permission, PERMISSION_TYPE};
