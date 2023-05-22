import React, {useEffect, useState} from 'react';
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
import Dialog from 'react-native-dialog';
import {useDispatch, useSelector} from 'react-redux';

import {
  Header,
  Loader,
  CheckBox,
  AppText,
  ErrorMessage,
  MultiSelectDD,
} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {setLoader} from '../../../redux/common/commonSlice';
import {Styles} from '../../../styles';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {validateInput} from '../../../utils/Validation';
import {Commons} from '../../../utils';
import {postApiCall} from '../../../services/ApiServices';
import {logout} from '../../../redux/auth/authSlice';

function MarkScheduledAttendance(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const studentsList = useSelector(state => state.Tab.studentsList);
  const teachersList = useSelector(state => state.Tab.attTeachers);
  const scheduleAtt = useSelector(state => state.Tab.teacherAttSchedule);

  const [subjectID, setSubjectID] = useState('');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [batchID, setBatchID] = useState('');
  const [batch, setBatch] = useState('');
  const [lectureID, setLectureID] = useState('');
  const [lecture, setLecture] = useState('');
  const [venueID, setVenueID] = useState('');
  const [venue, setVenue] = useState('');
  const [scheduled, setIsScheduled] = useState('');
  const [timetableID, setTimetableID] = useState('');
  const [teacherID, setTeacherID] = useState('');

  const [teacherErr, setTeacherErr] = useState('');
  const [teacherErrorV, setTeacherErrorV] = useState(false);

  const [selectAll, setSelectAll] = useState('');
  const [filterVal, setFilterVal] = useState('All');
  const [teachers, setTeachers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(studentsList);
    setData(studentsList);
    setTeachers(teachersList);
  }, [studentsList]);

  useEffect(() => {
    getAttendanceDetailsData();
  }, [scheduleAtt]);

  const getAttendanceDetailsData = () => {
    setSubject(scheduleAtt.SubjectName);
    setSubjectID(scheduleAtt.SubjectID);
    setVenue(scheduleAtt.VenueName);
    setVenueID(scheduleAtt.VenueID);
    setLecture(scheduleAtt.LectureTypeName);
    setLectureID(scheduleAtt.LectureTypeID);
    setBatch(scheduleAtt.BatchName);
    setBatchID(scheduleAtt.BatchID);
    setIsScheduled(scheduleAtt.IsScheduled);
    setTimetableID(scheduleAtt.TimetableID);
    setStartTime(scheduleAtt.StartTime);
    setEndTime(scheduleAtt.EndTime);
  };

  useEffect(() => {
    if (teachers.length !== 0) {
      let selected = teachers.filter(item => item.isSelected);
      if (selected.length === 0) {
        setTeacherID('');
      } else {
        setTeacherID(selected.map(val => val.id).join(','));
      }
    }
  }, [teachers]);

  function onSelectTeacher() {
    return obj => {
      handleTeacherSelect(obj.id);
      setTeacherErr('');
      setTeacherErrorV(false);
    };
  }

  const handleTeacherSelect = id => {
    let temp = teachers.map(val => {
      if (id === val.id) {
        return {...val, isSelected: !val.isSelected};
      }
      return val;
    });
    setTeachers(temp);
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

  const onCreate = () => {
    hideKeyboard();
    dispatch(setLoader(true));
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
      SubjectID: subjectID,
      VenueID: venueID,
      LectureTypeID: lectureID,
      BatchID: batchID,
      CoTeacherIds: teacherID === '' ? null : teacherID,
      StartTime: startTime,
      EndTime: endTime,
      Reason: reason,
      IsScheduled: scheduled,
      TimetableID: timetableID,
      Students: students,
    };
    postApiCall(END_POINT.TS_ATTENDANCE, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length == 0) {
            Commons.snackBar(res.Message, COLORS.green);
            clearFields();
            props.navigation.goBack();
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

  const clearFields = () => {
    setSubjectID('');
    setVenueID('');
    setLectureID('');
    setBatchID('');
    setTeacherID('');
    setSubject('');
    setVenue('');
    setLecture('');
    setBatch('');
    setTeachers('');
    setTeachers([]);
    setData([]);
    setFilteredData([]);
    setSelectedTeacher(null);
    setFilterVal('All');
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
                    onAttendanceCheck(index, '1');
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
                    onAttendanceCheck(index, '2');
                  }}
                  title={'Absent'}
                  isChecked={item.Status == '2' ? true : false}
                  checkBoxSize={24}
                  checkBoxColor={COLORS.primary}
                  checkBoxLabelColor={COLORS.primary}
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
                    onAttendanceCheck(index, '3');
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
                    onAttendanceCheck(index, '4');
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

  const countStudents = status => {
    return filteredData.filter(user => {
      return user.Status.includes(status);
    }).length;
  };

  const handleSelectAllStudents = status => {
    if (filteredData.length !== 0) {
      setSelectAll(status);
      let temp = filteredData.map(val => {
        return {...val, Status: status};
      });
      setFilteredData(temp);
      setData(temp);
    }
  };

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = () => {
    setVisible(false);
    onCreate();
  };

  return (
    <>
      <SafeAreaView style={Styles.statusBarSafeArea} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Styles.safeArea_}>
        <Header
          navigation={props.navigation}
          title={'Mark Attendance'}
          showBackButton={true}
          showDrawerBtn={false}
          showRightBtn={true}
          onBackPress={() => {
            props.navigation.goBack();
          }}
          onRightBtnPress={showDialog}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={Styles.test_main_cont}>
            <View style={Styles.tExamDetailsCont}>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText
                    children={'Class/Subject'}
                    style={{color: COLORS.primary}}
                  />
                  <TextInput
                    name="subject"
                    editable={false}
                    placeholder="Class/Subject"
                    value={subject}
                    placeholderTextColor={COLORS.gray}
                    style={Styles.t_exam_detail_field_data}
                  />
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText children={'Venue'} style={{color: COLORS.primary}} />
                  <TextInput
                    name="venue"
                    editable={false}
                    placeholder="Venue"
                    value={venue}
                    placeholderTextColor={COLORS.gray}
                    style={Styles.t_exam_detail_field_data}
                  />
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText
                    children={'Lecture Type'}
                    style={{color: COLORS.primary}}
                  />
                  <TextInput
                    name="lecture"
                    editable={false}
                    placeholder="Lecture"
                    value={lecture}
                    placeholderTextColor={COLORS.gray}
                    style={Styles.t_exam_detail_field_data}
                  />
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText children={'Batch'} style={{color: COLORS.primary}} />
                  <TextInput
                    name="batch"
                    editable={false}
                    placeholder="Batch"
                    value={batch}
                    placeholderTextColor={COLORS.gray}
                    style={Styles.t_exam_detail_field_data}
                  />
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText
                    children={'Co-Teacher'}
                    style={{color: COLORS.primary}}
                  />
                  <MultiSelectDD
                    data={teachers}
                    label="Select Teacher"
                    onSelect={onSelectTeacher()}
                  />
                  {teacherErrorV && <ErrorMessage message={teacherErr} />}
                </View>
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
                <Pressable onPress={() => {}} style={Styles.from_date_cont}>
                  <AppText
                    children={'Start Time'}
                    style={Styles.date_view_title}
                  />
                  <AppText
                    children={startTime ? startTime : 'Select Time'}
                    style={Styles.date_view_text}
                  />
                </Pressable>
                <Pressable onPress={() => {}} style={Styles.to_date_cont}>
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
              <View
                style={[
                  Styles.t_exam_detail_field_view,
                  {
                    borderTopWidth: RFValue(1),
                    borderTopColor: COLORS.gray,
                  },
                ]}>
                <AppText
                  children={'Total Students'}
                  style={[
                    Styles.t_exam_detail_field_title,
                    {marginTop: RFValue(5)},
                  ]}
                />
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    paddingTop: RFValue(5),
                  }}>
                  <AppText
                    children={`Students: ${data.length}`}
                    style={{fontSize: RFValue(11)}}
                  />
                  <AppText
                    children={`Present: ${countStudents('1')}`}
                    style={{fontSize: RFValue(11)}}
                  />
                  <AppText
                    children={`Absent: ${countStudents('2')}`}
                    style={{fontSize: RFValue(11)}}
                  />
                  <AppText
                    children={`Leave: ${countStudents('3')}`}
                    style={{fontSize: RFValue(11)}}
                  />
                  <AppText
                    children={`Late: ${countStudents('4')}`}
                    style={{fontSize: RFValue(11)}}
                  />
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
              contentContainerStyle={Styles.attendanceListContentCont}
            />
          </View>
        </ScrollView>
        <View
          style={{
            backgroundColor: COLORS.white,
            width: '100%',
            position: 'absolute',
            bottom: 0,
            borderBottomWidth: RFValue(1),
            borderBottomColor: COLORS.gray,
            alignItems: 'center',
          }}>
          <View style={{width: '95%'}}>
            <AppText
              children={'Mark All'}
              style={{
                color: COLORS.primary,
                paddingTop: RFValue(5),
              }}
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
                    handleSelectAllStudents('1');
                  }}
                  title={'Present'}
                  isChecked={selectAll == '1' ? true : false}
                  checkBoxSize={26}
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
                    handleSelectAllStudents('2');
                  }}
                  title={'Absent'}
                  isChecked={selectAll == '2' ? true : false}
                  checkBoxSize={26}
                  checkBoxColor={COLORS.primary}
                  checkBoxLabelColor={COLORS.primary}
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
                    handleSelectAllStudents('3');
                  }}
                  title={'Leave'}
                  isChecked={selectAll == '3' ? true : false}
                  checkBoxSize={26}
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
                    handleSelectAllStudents('4');
                  }}
                  title={'Late'}
                  isChecked={selectAll == '4' ? true : false}
                  checkBoxSize={26}
                  checkBoxColor={COLORS.blue}
                  checkBoxLabelColor={COLORS.blue}
                />
              </View>
            </View>
          </View>
        </View>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Attendance</Dialog.Title>
          <Dialog.Description>
            Do you want to proceed with marked attendance?.
          </Dialog.Description>
          <Dialog.Button label="No" onPress={handleCancel} />
          <Dialog.Button label="Yes" onPress={handleCreate} />
        </Dialog.Container>
      </KeyboardAvoidingView>
      {loader ? <Loader /> : null}
    </>
  );
}

export default MarkScheduledAttendance;
