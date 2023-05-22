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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Dialog from 'react-native-dialog';
import {useDispatch, useSelector} from 'react-redux';

import moment from 'moment';

import {
  Header,
  Loader,
  CheckBox,
  AppText,
  ErrorMessage,
  DropDown,
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
import {setStudentsList} from '../../../redux/tabs/tabSlice';

function TAttendancCreate(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const studentsList = useSelector(state => state.Tab.studentsList);

  const teacherAttendances = useSelector(
    state => state.Tab.teacherAttendanceRes,
  );
  const [subjectID, setSubjectID] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [batchID, setBatchID] = useState('');
  const [lectureID, setLectureID] = useState('');
  const [venueID, setVenueID] = useState('');
  const [teacherID, setTeacherID] = useState('');

  const [subjectNameErr, setSubjectNameErr] = useState('');
  const [venueErr, setVenueErr] = useState('');
  const [lectureTypeErr, setLectureTypeErr] = useState('');
  const [batchErr, setBatchErr] = useState('');
  const [teacherErr, setTeacherErr] = useState('');
  const [startTimeErr, setStartTimeErr] = useState('');
  const [endTimeErr, setEndTimeErr] = useState('');

  const [subjectNameErrorV, setSubjectNameErrorV] = useState(false);
  const [venueErrorV, setVenueErrorV] = useState(false);
  const [lectureTypeErrorV, setLectureTypeErrorV] = useState(false);
  const [batchErrorV, setBatchErrorV] = useState(false);
  const [startTimeErrorV, setStartTimeErrorV] = useState(false);
  const [endTimeErrorV, setEndTimeErrorV] = useState(false);
  const [teacherErrorV, setTeacherErrorV] = useState(false);

  const [selectAll, setSelectAll] = useState('');
  const [filterVal, setFilterVal] = useState('All');
  const [timeCheck, setTimeCheck] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [venues, setVenues] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setSubjects(Commons.subjectsArray(teacherAttendances.Subjects));
    });
    return unsubscribe;
  }, [props.navigation]);

  useEffect(() => {
    if (batches.length !== 0) {
      let selected = batches.filter(item => item.isSelected);
      if (selected.length === 0) {
        setData([]);
        setFilteredData([]);
        setBatchID('');
      } else {
        setBatchID(selected.map(val => val.id).join(','));
      }
    }
  }, [batches]);

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

  function onSelectSubject() {
    return obj => {
      getStudents(obj.id);
      setSubjectID(obj.id);
      setSelectedSubject(obj.item);
      setSubjectNameErr('');
      setSubjectNameErrorV(false);
    };
  }

  function onSelectVenue() {
    return obj => {
      setVenueID(obj.id);
      setSelectedVenue(obj.item);
      setVenueErr('');
      setVenueErrorV(false);
    };
  }

  function onSelectLecture() {
    return obj => {
      setLectureID(obj.id);
      setSelectedLecture(obj.item);
      setLectureTypeErr('');
      setLectureTypeErrorV(false);
    };
  }

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

  function onSelectBatch() {
    return obj => {
      handleBatchSelect(obj.id);
      if (obj.id === '0') {
        setFilteredData(studentsList);
        setData(studentsList);
      } else {
        let filterData = studentsList.filter(function (item) {
          return item.BatchID === obj.id;
        });
        setData(filterData);
        setFilteredData(filterData);
      }
      setBatchErr('');
      setBatchErrorV(false);
    };
  }

  const handleBatchSelect = id => {
    let temp = batches.map(val => {
      if (id === val.id) {
        return {...val, isSelected: !val.isSelected};
      }
      return val;
    });
    setBatches(temp);
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

  const getStudents = id => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: id,
    };
    postApiCall(END_POINT.GET_STUDENTS_VENUES, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            setVenues(Commons.venuesArray(res.Data.Venues));
            setLectures(Commons.LectureArray(res.Data.LectureTypes));
            setBatches(Commons.batchArray(res.Data.Batches));
            setTeachers(Commons.coTeacherArray(res.Data.CoTeachers));
            const stdRes = res.Data.Students;
            for (var i = 0; i < stdRes.length; i++) {
              let arr = stdRes;
              arr.forEach(object => {
                object.Status = '1';
              });
              dispatch(setStudentsList(arr));
            }
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
        <Image source={IMAGES.noData} style={Styles.noDataImg3} />
      </View>
    );
  };

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  const onCreate = () => {
    hideKeyboard();
    if (!validateInput(selectedSubject).status) {
      setSubjectNameErrorV(true);
      setSubjectNameErr(
        validateInput(selectedSubject, 'Please select class/subject').error,
      );
      return;
    }
    if (!validateInput(selectedVenue).status) {
      setVenueErrorV(true);
      setVenueErr(validateInput(selectedVenue, 'Please select venue').error);
      return;
    }
    if (!validateInput(selectedLecture).status) {
      setLectureTypeErrorV(true);
      setLectureTypeErr(
        validateInput(selectedLecture, 'Please select lecture type').error,
      );
      return;
    }
    if (!validateInput(batchID).status) {
      setBatchErrorV(true);
      setBatchErr(validateInput(selectedBatch, 'Please select batch').error);
      return;
    }
    if (!validateInput(startTime).status) {
      setStartTimeErrorV(true);
      setStartTimeErr(
        validateInput(startTime, 'Please select start time').error,
      );
      return;
    }
    if (!validateInput(endTime).status) {
      setEndTimeErrorV(true);
      setEndTimeErr(validateInput(endTime, 'Please select end time').error);
      return;
    }

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
      IsScheduled: '0',
      TimetableID: '0',
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
    setStartTime('');
    setEndTime('');
    setSubjects([]);
    setVenues([]);
    setLectures([]);
    setBatches([]);
    setTeachers([]);
    setData([]);
    setFilteredData([]);
    setSelectedSubject(null);
    setSelectedVenue(null);
    setSelectedLecture(null);
    setSelectedBatch(null);
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
            clearFields();
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
                  <DropDown
                    data={subjects}
                    label="Select Class/Subject"
                    value={selectedSubject}
                    onSelect={onSelectSubject()}
                  />
                  {subjectNameErrorV && (
                    <ErrorMessage message={subjectNameErr} />
                  )}
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText children={'Venue'} style={{color: COLORS.primary}} />
                  <DropDown
                    data={venues}
                    label="Select Venue"
                    value={selectedVenue}
                    onSelect={onSelectVenue()}
                  />
                  {venueErrorV && <ErrorMessage message={venueErr} />}
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText
                    children={'Lecture Type'}
                    style={{color: COLORS.primary}}
                  />
                  <DropDown
                    data={lectures}
                    label="Select Lecture Type"
                    value={selectedLecture}
                    onSelect={onSelectLecture()}
                  />
                  {lectureTypeErrorV && (
                    <ErrorMessage message={lectureTypeErr} />
                  )}
                </View>
              </View>
              <View style={Styles.subjectDropDownCont2}>
                <View style={Styles.subjectDropDownStyles2}>
                  <AppText children={'Batch'} style={{color: COLORS.primary}} />
                  <MultiSelectDD
                    data={batches}
                    label="Select Batch"
                    onSelect={onSelectBatch()}
                  />
                  {batchErrorV && <ErrorMessage message={batchErr} />}
                </View>
              </View>
              {user.CoTeacherAttendance == 1 && (
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
              )}
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
                    setTimeCheck(true);
                    showTimePicker();
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
                    setTimeCheck(false);
                    showTimePicker();
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
              {startTimeErrorV && <ErrorMessage message={startTimeErr} />}
              {endTimeErrorV && <ErrorMessage message={endTimeErr} />}
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
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          is24Hour={true}
          date={new Date()}
          onConfirm={
            timeCheck
              ? data => {
                  pickADateTime(data, 'Start');
                  setStartTimeErr('');
                  setStartTimeErrorV(false);
                }
              : data => {
                  pickADateTime(data, 'End');
                  setEndTimeErr('');
                  setEndTimeErrorV(false);
                }
          }
          onCancel={hideTimePicker}
        />
      </KeyboardAvoidingView>
      {loader ? <Loader /> : null}
    </>
  );
}

export default TAttendancCreate;
