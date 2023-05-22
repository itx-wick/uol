import React, {useState, useRef} from 'react';
import {View, TextInput, Keyboard} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  Screen,
  Header,
  Loader,
  AppButton,
  ErrorMessage,
} from '../../components';
import {COLORS, END_POINT, ROUTES} from '../../constants';
import {logout} from '../../redux/auth/authSlice';
import {setLoader} from '../../redux/common/commonSlice';
import {postApiCall} from '../../services/ApiServices';
import {Styles} from '../../styles';
import {Commons} from '../../utils';
import {validateInput} from '../../utils/Validation';

function ChangePassword(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);

  var newPwdRef = useRef(null);
  var confirmPwdRef = useRef(null);

  const [newPwd, setNewPwd] = useState('');
  const [newPwdErr, setNewPwdErr] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [confirmPwdErr, setConfirmPwdErr] = useState('');
  const [newPwdErrorV, setNewPwdErrorV] = useState(false);
  const [confirmPwdErrorV, setConfirmPwdErrorV] = useState(false);

  const onNewPwdChange = data => {
    setNewPwd(data);
    setNewPwdErr('');
    setNewPwdErrorV(false);
  };

  const onConfirmPwdChange = data => {
    setConfirmPwd(data);
    setConfirmPwdErr('');
    setConfirmPwdErrorV(false);
  };

  const onSubmit = () => {
    hideKeyboard();
    if (!validateInput(newPwd).status) {
      setNewPwdErrorV(true);
      setNewPwdErr(validateInput(newPwd, 'Please enter new password').error);
      return;
    }
    if (!validateInput(confirmPwd).status) {
      setConfirmPwdErrorV(true);
      setConfirmPwdErr(
        validateInput(confirmPwd, 'Please enter confirm password').error,
      );
      return;
    }
    if (newPwd !== confirmPwd) {
      setConfirmPwdErrorV(true);
      setConfirmPwdErr(
        validateInput('', 'Password and Confirm Password not matched').error,
      );
      return;
    }
    dispatch(setLoader(true));
    var entry = {};
    let student = [];
    entry = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
    };
    student.push(entry);
    let data =
      userType === 'T'
        ? {
            ID: user.ID,
            APIAccessToken: user.APIAccessToken,
            Password: confirmPwd,
          }
        : {
            Students: student,
            Type: userType,
            Password: confirmPwd,
          };
    let endPoint =
      userType === 'T' ? END_POINT.TC_PASSWORD : END_POINT.UC_PASSWORD;
    postApiCall(endPoint, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          setNewPwd('');
          setConfirmPwd('');
          if (userType === 'T') {
            if (Object.keys(res.Data).length === 0) {
              Commons.snackBar(res.Message, COLORS.green);
            }
          } else {
            if (Object.keys(res.Data).length !== 0) {
              Commons.snackBar('Success', COLORS.green);
            }
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        dispatch(setLoader(false));
        console.log(err);
      });
  };

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <Screen style={{backgroundColor: COLORS.white}}>
        <Header
          navigation={props.navigation}
          title={'Change Password'}
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
                  newPwdRef = ref;
                }}
                name="newPwd"
                keyboardType="default"
                returnKeyType="next"
                placeholder="New Password"
                secureTextEntry
                value={newPwd}
                onChangeText={onNewPwdChange}
                onSubmitEditing={() => confirmPwdRef.focus()}
                placeholderTextColor={COLORS.gray}
                style={Styles.change_pwd_input_field}
              />
              {newPwdErrorV && <ErrorMessage message={newPwdErr} />}
            </View>
            <View style={Styles.change_pwd_input_view_2}>
              <TextInput
                ref={ref => {
                  confirmPwdRef = ref;
                }}
                name="confirmNewPwd"
                keyboardType="default"
                returnKeyType="done"
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPwd}
                onChangeText={onConfirmPwdChange}
                onSubmitEditing={hideKeyboard}
                placeholderTextColor={COLORS.gray}
                style={Styles.change_pwd_input_field}
              />
              {confirmPwdErrorV && <ErrorMessage message={confirmPwdErr} />}
            </View>
            <AppButton
              title="Change Password"
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

export default ChangePassword;
