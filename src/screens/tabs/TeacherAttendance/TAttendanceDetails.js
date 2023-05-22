import React, {useState, useEffect} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  TextInput,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useDispatch, useSelector} from 'react-redux';
import Dialog from 'react-native-dialog';

import moment from 'moment';

import {Header, Loader, CheckBox, AppText} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {setLoader} from '../../../redux/common/commonSlice';
import {Styles} from '../../../styles';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {Commons} from '../../../utils';
import {postApiCall} from '../../../services/ApiServices';
import {logout} from '../../../redux/auth/authSlice';

function TAttendanceDetails(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const attendanceDetails = useSelector(
    state => state.Tab.teacherAttendanceDetails,
  );
  const tAttendanceID = useSelector(state => state.Tab.tAttendanceID);

  const [attendanceID, setAttendanceID] = useState('');
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [filterVal, setFilterVal] = useState('All');
  const [timeCheck, setTimeCheck] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    getAttendanceDetailsData();
  }, [attendanceDetails]);

  const getAttendanceDetailsData = () => {
    let sTime = moment(attendanceDetails.StartTime, ['HH:mm']).format('hh:mm');
    let eTime = moment(attendanceDetails.EndTime, ['HH:mm']).format('hh:mm');
    setAttendanceID(tAttendanceID);
    setStartTime(sTime);
    setEndTime(eTime);
    setReason(attendanceDetails.Reason);
    setData(attendanceDetails.Students);
    setFilteredData(attendanceDetails.Students);
  };

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const pickADateTime = (data, check) => {
    let tempTime = moment(data).format('HH:mm');
    if (check === 'Start') {
      setStartTime(tempTime);
    } else {
      setEndTime(tempTime);
    }
    hideTimePicker();
  };

  const onReasonChange = data => {
    setReason(data);
  };

  const filterStudents = text => {
    const newData = data.filter(item => {
      const itemData = item.Status;
      return itemData.indexOf(text) > -1;
    });
    setFilteredData(newData);
  };

  const DataNotFound = () => {
    return (
      <View style={{flex: 1}}>
        <Image source={IMAGES.noData} style={Styles.noDataImg2} />
      </View>
    );
  };

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  const onUpdate = () => {
    hideKeyboard();
    let students = [];
    for (let i = 0; i < data.length; i++) {
      var entry = {};
      entry = {
        ID: data[i].ID,
        Status: data[i].Status,
      };
      students.push(entry);
    }
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      AttendanceID: attendanceID,
      StartTime: startTime,
      EndTime: endTime,
      Reason: reason,
      Students: students,
    };
    dispatch(setLoader(true));
    postApiCall(END_POINT.SUBMIT_EDIT_ATTENDANCE, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.reset(props.navigation, ROUTES.T_ATTENDANCE);
            Commons.snackBar(res.Message, COLORS.green);
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

  const renderItem = ({item, index}) => {
    return (
      <View>
        <View
          style={[
            Styles.t_exam_detail_student_list_card,
            {paddingBottom: RFValue(2)},
          ]}>
          <View style={{width: '15%'}}>
            <>
              {item.ProfilePic && item.ProfilePic !== '' ? (
                <Image
                  source={{uri: item.ProfilePic}}
                  style={Styles.studentImage}
                />
              ) : (
                <View style={Styles.stdInitials}>
                  <AppText
                    style={Styles.stdInitialsText}
                    children={Commons.getInitials(
                      item.FirstName + ' ' + item.LastName,
                    )}
                  />
                </View>
              )}
            </>
          </View>
          <View style={{width: '85%', paddingLeft: RFValue(10)}}>
            <View style={{flexDirection: 'row'}}>
              <AppText
                children={
                  item.FirstName != undefined ||
                  item.FirstName != null ||
                  item.FirstName != ''
                    ? item.FirstName + ' '
                    : ''
                }
                numberOfLines={1}
                style={{fontWeight: 'bold', color: COLORS.black}}
              />
              <AppText
                children={
                  item.LastName !== undefined ||
                  item.LastName !== null ||
                  item.LastName !== ''
                    ? item.LastName
                    : ''
                }
                numberOfLines={1}
                style={{fontWeight: 'bold', color: COLORS.black}}
              />
              <AppText
                children={
                  item.LastName === ''
                    ? '- ' + item.RollNo
                    : ' - ' + item.RollNo
                }
                numberOfLines={1}
                style={{fontWeight: 'bold', color: COLORS.black}}
              />
            </View>
            <View
              style={[
                Styles.divider_full,
                {
                  marginVertical: RFValue(0),
                },
              ]}
            />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  width: '25%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CheckBox
                  onPress={() => {
                    {
                      user.EditAttendance == 1 && onAttendanceCheck(index, '1');
                    }
                  }}
                  title={'Present'}
                  isChecked={item.Status == '1' ? true : false}
                  checkBoxSize={24}
                  checkBoxColor={COLORS.green}
                  checkBoxLabelColor={COLORS.green}
                />
              </View>
              <View
                style={{
                  width: '25%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CheckBox
                  onPress={() => {
                    {
                      user.EditAttendance == 1 && onAttendanceCheck(index, '2');
                    }
                  }}
                  title={'Absent'}
                  isChecked={item.Status == '2' ? true : false}
                  checkBoxSize={24}
                  checkBoxColor={COLORS.danger}
                  checkBoxLabelColor={COLORS.danger}
                />
              </View>
              <View
                style={{
                  width: '25%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CheckBox
                  onPress={() => {
                    {
                      user.EditAttendance == 1 && onAttendanceCheck(index, '3');
                    }
                  }}
                  title={'Leave'}
                  isChecked={item.Status == '3' ? true : false}
                  checkBoxSize={24}
                  checkBoxColor={COLORS.darkYellow}
                  checkBoxLabelColor={COLORS.darkYellow}
                />
              </View>
              <View
                style={{
                  width: '25%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CheckBox
                  onPress={() => {
                    {
                      user.EditAttendance == 1 && onAttendanceCheck(index, '4');
                    }
                  }}
                  title={'Late'}
                  isChecked={item.Status == '4' ? true : false}
                  checkBoxSize={24}
                  checkBoxColor={COLORS.blue}
                  checkBoxLabelColor={COLORS.blue}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const onAttendanceCheck = (index, value) => {
    const fData = [...filteredData];
    fData[index].Status = value;
    setFilteredData(fData);
    setData(fData);
  };

  const showDialog = () => {
    {
      user.EditAttendance == 1 && setVisible(true);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleUpdate = () => {
    setVisible(false);
    onUpdate();
  };

  return (
    <>
      <SafeAreaView style={Styles.statusBarSafeArea} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Styles.safeArea_}>
        <Header
          navigation={props.navigation}
          title={'Attendance Details'}
          showBackButton={true}
          showDrawerBtn={false}
          showRightBtn={true}
          onBackPress={() => {
            props.navigation.goBack();
          }}
          onRightBtnPress={showDialog}
        />
        <ScrollView>
          <View style={Styles.test_main_cont}>
            <View style={Styles.tExamDetailsCont}>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Subject'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  value={`${attendanceDetails.Subject}`}
                  editable={false}
                  style={Styles.t_exam_detail_field_data}
                />
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Venue'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  value={`${attendanceDetails.Venue}`}
                  editable={false}
                  style={Styles.t_exam_detail_field_data}
                />
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Lecture Type'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  value={`${attendanceDetails.LectureType}`}
                  editable={false}
                  style={Styles.t_exam_detail_field_data}
                />
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Batch'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  value={`${attendanceDetails.Batch}`}
                  editable={false}
                  style={Styles.t_exam_detail_field_data}
                />
              </View>

              <View
                style={[
                  Styles.dates_cont,
                  {
                    width: '100%',
                    padding: RFValue(0),
                    marginTop: RFValue(5),
                  },
                ]}>
                <Pressable
                  onPress={() => {
                    {
                      user.EditAttendance == 1 &&
                        (setTimeCheck(true), showTimePicker());
                    }
                  }}
                  style={Styles.from_date_cont}>
                  <AppText
                    children={'Start Time'}
                    style={Styles.date_view_title}
                  />
                  <AppText
                    children={startTime ? startTime : 'Select Time'}
                    style={Styles.date_view_text}
                  />
                </Pressable>
                <Pressable
                  onPress={() => {
                    {
                      user.EditAttendance == 1 &&
                        (setTimeCheck(false), showTimePicker());
                    }
                  }}
                  style={Styles.to_date_cont}>
                  <AppText
                    children={'End Time'}
                    style={Styles.date_view_title}
                  />
                  <AppText
                    children={endTime ? endTime : 'Select Time'}
                    style={Styles.date_view_text}
                  />
                </Pressable>
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Reason'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  name="reason"
                  keyboardType="default"
                  returnKeyType="done"
                  placeholder="Enter Reason"
                  value={reason}
                  editable={user.EditAttendance == 0 ? true : false}
                  onChangeText={onReasonChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Filter By'}
                  style={Styles.t_exam_detail_field_title}
                />
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CheckBox
                      onPress={() => {
                        setFilterVal('All');
                        setFilteredData(data);
                      }}
                      title={'All'}
                      isChecked={filterVal == 'All' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.primary}
                      checkBoxLabelColor={COLORS.primary}
                    />
                  </View>
                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CheckBox
                      onPress={() => {
                        setFilterVal('Present');
                        filterStudents('1');
                      }}
                      title={'Present'}
                      isChecked={filterVal == 'Present' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.green}
                      checkBoxLabelColor={COLORS.green}
                    />
                  </View>
                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CheckBox
                      onPress={() => {
                        setFilterVal('Absent');
                        filterStudents('2');
                      }}
                      title={'Absent'}
                      isChecked={filterVal == 'Absent' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.danger}
                      checkBoxLabelColor={COLORS.danger}
                    />
                  </View>
                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CheckBox
                      onPress={() => {
                        setFilterVal('Leave');
                        filterStudents('3');
                      }}
                      title={'Leave'}
                      isChecked={filterVal == 'Leave' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.darkYellow}
                      checkBoxLabelColor={COLORS.darkYellow}
                    />
                  </View>
                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CheckBox
                      onPress={() => {
                        setFilterVal('Late');
                        filterStudents('4');
                      }}
                      title={'Late'}
                      isChecked={filterVal == 'Late' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.blue}
                      checkBoxLabelColor={COLORS.blue}
                    />
                  </View>
                </View>
              </View>
            </View>
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={DataNotFound}
              style={Styles.announcement_list}
              contentContainerStyle={Styles.announcement_list_container}
            />
          </View>
        </ScrollView>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Attendance</Dialog.Title>
          <Dialog.Description>
            Do you want to update the attendance?.
          </Dialog.Description>
          <Dialog.Button label="No" onPress={handleCancel} />
          <Dialog.Button label="Yes" onPress={handleUpdate} />
        </Dialog.Container>
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          date={new Date()}
          onConfirm={
            timeCheck
              ? data => pickADateTime(data, 'Start')
              : data => pickADateTime(data, 'End')
          }
          onCancel={hideTimePicker}
        />
      </KeyboardAvoidingView>
      {loader ? <Loader /> : null}
    </>
  );
}

export default TAttendanceDetails;
