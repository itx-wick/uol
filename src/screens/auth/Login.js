import React, {useState, useEffect} from 'react';
import {Image, Keyboard, TextInput, View, Alert} from 'react-native';

import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AppButton,
  AppText,
  DropDown,
  ErrorMessage,
  Loader,
  Screen,
} from '../../components';

import {COLORS, END_POINT, IMAGES, ROUTES} from '../../constants';
import {Styles} from '../../styles';
import {LoginOptions} from '../../data';
import {isValidHttpUrl, validateInput} from '../../utils/Validation';
import {
  clearUsersList,
  setLoader,
  setUsersList,
  setUserType,
  setBaseLink,
} from '../../redux/common/commonSlice';
import {postApiCall} from '../../services/ApiServices';
import {login, logout} from '../../redux/auth/authSlice';
import {Commons} from '../../utils';
import {checkNotificationPermission} from '../../services/NotificationService';

function Login(props) {
  var userNameRef = React.useRef(null);
  var passwordRef = React.useRef(null);

  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);

  const [userName, setUserName] = useState('');
  const [userNameErr, setUserNameErr] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [loginAsErr, setLoginAsErr] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [selectedOptType, setSelectedOptType] = useState('');
  const [userNameErrorV, setUserNameErrorV] = useState(false);
  const [passwordErrorV, setPasswordErrorV] = useState(false);
  const [loginAsErrorV, setLoginAsErrorV] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    dispatch(setLoader(false));
    checkNotificationPermission();
    getDeviceInfo();
  }, []);

  const getDeviceInfo = () => {
    DeviceInfo.getDeviceName().then(name => {
      setDeviceName(name);
    });
  };

  const onUserNameChange = data => {
    setUserName(data.toLowerCase());
    setUserNameErr('');
    setUserNameErrorV(false);
  };

  const onPasswordChange = data => {
    setPassword(data);
    setPasswordErr('');
    setPasswordErrorV(false);
  };

  function onSelectOption() {
    return obj => {
      setSelectedOption(obj.item);
      setLoginAsErr('');
      setLoginAsErrorV(false);
      setSelectedOptType(obj.type);
    };
  }

  const hideKeyboard = () => {
    Keyboard.dismiss();
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
    if (Object.keys(selectedOption).length === 0) {
      setLoginAsErrorV(true);
      setLoginAsErr('Please select relation.');
      return;
    }
    dispatch(clearUsersList([]));
    dispatch(setLoader(true));
    dispatch(setUserType(selectedOptType));
    let data = {
      UserName: userName,
      Password: password,
      Type: selectedOptType,
      DeviceToken: fcmToken,
      DeviceType: deviceName,
    };
    let endPoint =
      selectedOptType === 'T' ? END_POINT.T_LOGIN : END_POINT.U_LOGIN;
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
            if (selectedOptType === 'T') {
              let response = res.Data.Teacher;
              dispatch(login(response));
            } else {
              let response = res.Data.Student;
              dispatch(setUsersList(response));
              dispatch(login(response));
            }
            Commons.reset(props.navigation, ROUTES.D_HOME);
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.danger);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        dispatch(setLoader(false));
        if (err.response) {
          console.log(err.response.data.message);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err);
        }
      });
  };

  return (
    <>
      <Screen style={{backgroundColor: COLORS.white}}>
        <ScrollView>
          <View style={Styles.login_main_cont}>
            <View style={Styles.logo_cont}>
              <Image source={IMAGES.uol_logo} style={Styles.login_logo} />
            </View>
            <View style={Styles.login_cont}>
              <AppText children={'Welcome'} style={Styles.login_welcome_txt} />
              <AppText
                children={'Hi there! Nice to see you again.'}
                style={Styles.login_desc_txt}
              />
              <View style={Styles.login_input1_view}>
                <TextInput
                  ref={ref => {
                    userNameRef = ref;
                  }}
                  name="username"
                  value={userName}
                  onChangeText={onUserNameChange}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.focus()}
                  placeholder="Username"
                  placeholderTextColor={COLORS.gray}
                  style={Styles.login_input_text}
                />
                {userNameErrorV && <ErrorMessage message={userNameErr} />}
              </View>
              <View style={Styles.login_input2_view}>
                <TextInput
                  ref={ref => {
                    passwordRef = ref;
                  }}
                  name="password"
                  value={password}
                  onChangeText={onPasswordChange}
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={hideKeyboard}
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor={COLORS.gray}
                  style={Styles.login_input_text}
                />
                {passwordErrorV && <ErrorMessage message={passwordErr} />}
              </View>
              <View style={Styles.login_input3_view}>
                <DropDown
                  data={LoginOptions}
                  label="Login As"
                  value={selectedOption}
                  onSelect={onSelectOption()}
                />
                {loginAsErrorV && <ErrorMessage message={loginAsErr} />}
              </View>
              <AppButton
                title="Login"
                onPress={onSubmit}
                btnStyle={Styles.login_submit_btn}
                titleStyle={Styles.login_submit_btn_txt}
              />
            </View>
          </View>
        </ScrollView>
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default Login;
