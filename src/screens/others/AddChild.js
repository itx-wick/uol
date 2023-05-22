import React, {useState, useEffect, useRef} from 'react';
import {View, TextInput, Keyboard} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import {
  Screen,
  Header,
  Loader,
  AppButton,
  ErrorMessage,
} from '../../components';
import {COLORS, END_POINT, ROUTES} from '../../constants';
import {
  setLoader,
  setUsersList,
  updateUsersList,
} from '../../redux/common/commonSlice';
import {postApiCall} from '../../services/ApiServices';
import {Styles} from '../../styles';
import {validateInput} from '../../utils/Validation';
import {Commons} from '../../utils';
import {logout} from '../../redux/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AddChild(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);

  var userNameRef = useRef(null);
  var passwordRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [userNameErr, setUserNameErr] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [deviceUniqueId, setDeviceUniqueId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [userNameErrorV, setUserNameErrorV] = useState(false);
  const [passwordErrorV, setPasswordErrorV] = useState(false);

  useEffect(() => {
    getDeviceInfo();
  }, []);

  const getDeviceInfo = () => {
    DeviceInfo.getUniqueId().then(uniqueId => {
      setDeviceUniqueId(uniqueId);
    });
    DeviceInfo.getDeviceName().then(name => {
      setDeviceName(name);
    });
  };

  const onUserNameChange = data => {
    setUserName(data);
    setUserNameErr('');
    setUserNameErrorV(false);
  };

  const onPasswordChange = data => {
    setPassword(data);
    setPasswordErr('');
    setPasswordErrorV(false);
  };

  const onSubmit = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    hideKeyboard();
    if (!validateInput(userName).status) {
      setUserNameErrorV(true);
      setUserNameErr(validateInput(userName, 'Please enter username').error);
      return;
    }
    if (!validateInput(password).status) {
      setPasswordErrorV(true);
      setPasswordErr(validateInput(password, 'Please enter password').error);
      return;
    }

    dispatch(setLoader(true));
    let data = {
      UserName: userName,
      Password: password,
      Type: userType,
      DeviceToken: fcmToken,
      DeviceType: deviceName,
    };

    postApiCall(END_POINT.U_LOGIN, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            let response = res.Data.Student;
            const isFound = userList.some(element => {
              if (element.ID === response.ID) {
                return true;
              }
              return false;
            });
            if (isFound) {
              // object is contained in array
              dispatch(updateUsersList(response));
              Commons.navigate(props.navigation, ROUTES.LOGIN);
            } else {
              dispatch(setUsersList(response));
            }
            setUserName('');
            setPassword('');
            Commons.navigate(props.navigation, ROUTES.HOME);
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {});
  };

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <Screen style={{backgroundColor: COLORS.white}}>
        <Header
          navigation={props.navigation}
          title={'Add Child'}
          showBackButton={true}
          showDrawerBtn={false}
          onBackPress={() => {
            props.navigation.goBack();
          }}
        />
        <View style={Styles.change_pwd_main_cont}>
          <View style={Styles.change_pwd_cont}>
            <View style={Styles.change_pwd_input_view_1}>
              <TextInput
                ref={ref => {
                  userNameRef = ref;
                }}
                name="username"
                keyboardType="default"
                returnKeyType="next"
                placeholder="Username"
                value={userName}
                onChangeText={onUserNameChange}
                onSubmitEditing={() => passwordRef.focus()}
                placeholderTextColor={COLORS.gray}
                style={Styles.change_pwd_input_field}
              />
              {userNameErrorV && <ErrorMessage message={userNameErr} />}
            </View>
            <View style={Styles.change_pwd_input_view_2}>
              <TextInput
                ref={ref => {
                  passwordRef = ref;
                }}
                name="password"
                keyboardType="default"
                returnKeyType="done"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={onPasswordChange}
                onSubmitEditing={hideKeyboard}
                placeholderTextColor={COLORS.gray}
                style={Styles.change_pwd_input_field}
              />
              {passwordErrorV && <ErrorMessage message={passwordErr} />}
            </View>
            <AppButton
              title="Add Child"
              onPress={onSubmit}
              btnStyle={Styles.change_pwd_submit_btn}
              titleStyle={Styles.change_pwd_submit_btn_txt}
            />
          </View>
        </View>
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default AddChild;
