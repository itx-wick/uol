import React, {useState, useEffect} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  TextInput,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';
import Dialog from 'react-native-dialog';

import {
  Header,
  Loader,
  AppText,
  ErrorMessage,
  CheckBox,
  DropDown,
  MultiSelectDD,
} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {Styles} from '../../../styles';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {setLoader} from '../../../redux/common/commonSlice';
import {postApiCall} from '../../../services/ApiServices';
import {setExamsStudentsData} from '../../../redux/tabs/tabSlice';
import {validateInput} from '../../../utils/Validation';
import {Commons} from '../../../utils';
import {logout} from '../../../redux/auth/authSlice';

function TExamCreate(props) {
  const dispatch = useDispatch();
  const tabBarHeight = useBottomTabBarHeight();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const teacherExams = useSelector(state => state.Tab.teacherExams);
  const examStudentsData = useSelector(state => state.Tab.examStudentsData);

  const [date, setDate] = useState('');
  const [subjectID, setSubjectID] = useState('');
  const [testID, setTestID] = useState('');
  const [batchID, setBatchID] = useState('');
  const [testName, setTestName] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [passMarks, setPassMarks] = useState('');
  const [filterVal, setFilterVal] = useState('All');
  const [desc, setDesc] = useState('');
  //Error Messages
  const [subjectNameErr, setSubjectNameErr] = useState('');
  const [testTypeErr, setTestTypeErr] = useState('');
  const [batchErr, setBatchErr] = useState('');
  const [testNameErr, setTestNameErr] = useState('');
  const [totalMarksErr, setTotalMarksErr] = useState('');
  const [passMarksErr, setPassMarksErr] = useState('');
  //Error Messages Display
  const [subjectNameErrorV, setSubjectNameErrorV] = useState(false);
  const [testTypeErrorV, setTestTypeErrorV] = useState(false);
  const [batchErrorV, setBatchErrorV] = useState(false);
  const [testNameErrorV, setTestNameErrorV] = useState(false);
  const [totalMarksErrorV, setTotalMarksErrorV] = useState(false);
  const [passMarksErrorV, setPassMarksErrorV] = useState(false);

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setSubjects(Commons.subjectsArray(teacherExams.Subjects));
  }, []);

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

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const pickADate = date => {
    let tempDate = new Date(date);
    let year = tempDate.getFullYear();
    let month = ('0' + (tempDate.getMonth() + 1)).slice(-2);
    let day = tempDate.getDate();
    let fDate = `${day}/${month}/${year}`;
    setDate(fDate);

    hideDatePicker();
  };

  function onSelectSubject() {
    return obj => {
      getStudents(obj.id);
      setSubjectID(obj.id);
      setSelectedSubject(obj.item);
      setSubjectNameErr('');
      setSubjectNameErrorV(false);
    };
  }

  function onSelectExamType() {
    return obj => {
      setTestID(obj.id);
      setSelectedExamType(obj.item);
      setTestTypeErr('');
      setTestTypeErrorV(false);
    };
  }

  function onSelectBatch() {
    return obj => {
      handleBatchSelect(obj.id);
      if (obj.id === '0') {
        setFilteredData(examStudentsData);
        setData(examStudentsData);
      } else {
        let filterData = examStudentsData.filter(function (item) {
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

  const onTestNameChange = data => {
    setTestName(data);
    setTestNameErr('');
    setTestNameErrorV(false);
  };

  const onTotalMarksChange = data => {
    setTotalMarks(data);
    setTotalMarksErr('');
    setTotalMarksErrorV(false);
  };

  const onPassMarksChange = data => {
    setPassMarks(data);
    setPassMarksErr('');
    setPassMarksErrorV(false);
  };

  const onDescChange = data => {
    setDesc(data);
  };

  const filterStudents = text => {
    const newData = data.filter(item => {
      const itemData = item.ExamStatus;
      return itemData.indexOf(text) > -1;
    });
    setFilteredData(newData);
  };

  const getStudents = id => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: id,
    };
    postApiCall(END_POINT.GET_STUDENTS_EXAM_TYPES, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            setExamTypes(Commons.testArray(res.Data.ExamTypes));
            setBatches(Commons.batchArray(res.Data.Batches));
            const stdRes = res.Data.Students;
            for (var i = 0; i < stdRes.length; i++) {
              let arr = stdRes;
              arr.forEach(object => {
                object.IsAbsent = 0;
                object.Status = false;
                object.ObtainedMarks = 0;
                object.ExamStatus = 'Fail';
              });
              dispatch(setExamsStudentsData(arr));
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

  const onSubmit = () => {
    if (!validateInput(selectedSubject).status) {
      setSubjectNameErrorV(true);
      setSubjectNameErr(
        validateInput(selectedSubject, 'Please select class/subject').error,
      );
      return;
    }
    if (!validateInput(selectedExamType).status) {
      setTestTypeErrorV(true);
      setTestTypeErr(
        validateInput(selectedExamType, 'Please select test type').error,
      );
      return;
    }
    if (!validateInput(batchID).status) {
      setBatchErrorV(true);
      setBatchErr(validateInput(batchID, 'Please select batch').error);
      return;
    }
    if (!validateInput(testName).status) {
      setTestNameErrorV(true);
      setTestNameErr(validateInput(testName, 'Please enter test name').error);
      return;
    }
    if (!validateInput(totalMarks).status) {
      setTotalMarksErrorV(true);
      setTotalMarksErr(
        validateInput(totalMarks, 'Please enter total marks').error,
      );
      return;
    }
    if (!validateInput(passMarks).status) {
      setPassMarksErrorV(true);
      setPassMarksErr(
        validateInput(passMarks, 'Please enter passing marks').error,
      );
      return;
    }
    dispatch(setLoader(true));
    let students = [];
    for (let i = 0; i < data.length; i++) {
      var entry = {};
      entry = {
        ID: data[i].ID,
        IsAbsent: data[i].IsAbsent == '1' ? true : false,
        ObtainedMarks: data[i].ObtainedMarks,
      };
      students.push(entry);
    }
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      Date: date,
      SubjectID: subjectID,
      ExamTypeID: testID,
      BatchID: batchID,
      TotalMarks: totalMarks,
      PassMarks: passMarks,
      Title: testName,
      Description: desc,
      Students: students,
    };
    postApiCall(END_POINT.T_SUBMIT_EXAM, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            clearFields();
            Commons.snackBar(res.Message, COLORS.green);
            Commons.reset(props.navigation, ROUTES.T_EXAMS);
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
    setTestID('');
    setBatchID('');
    setTestName('');
    setDate('');
    setTotalMarks('');
    setPassMarks('');
    setDesc('');
    setFilterVal('All');
    setSubjects([]);
    setExamTypes([]);
    setBatches([]);
    setData([]);
    setFilteredData([]);
    setSelectedSubject(null);
    setSelectedExamType(null);
  };

  const renderItem = ({item, index}) => {
    return (
      <View>
        <View style={Styles.t_exam_detail_student_list_card}>
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
          <View style={{width: '70%', paddingLeft: RFValue(10)}}>
            <View style={{flexDirection: 'row'}}>
              <AppText
                children={`${
                  item.FirstName != undefined ||
                  item.FirstName != null ||
                  item.FirstName != ''
                    ? item.FirstName + ' '
                    : ''
                }${
                  item.LastName !== undefined ||
                  item.LastName !== null ||
                  item.LastName !== ''
                    ? item.LastName
                    : ''
                }${
                  item.LastName === ''
                    ? '- ' + item.RollNo
                    : ' - ' + item.RollNo
                }`}
                numberOfLines={1}
                style={{fontWeight: 'bold'}}
              />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                key={index}
                name="obtainedMarks"
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="Obtained Marks"
                editable={item.IsAbsent === '1' ? false : true}
                value={item.IsAbsent === '1' ? '0' : item.ObtainedMarks}
                onChangeText={val => onTextChanged(index, val)}
                placeholderTextColor={COLORS.gray}
                style={Styles.t_exam_detail_field_student_input_data}
              />
              <AppText
                children={item.ExamStatus}
                style={{
                  color:
                    item.ExamStatus === 'Pass' ? COLORS.green : COLORS.danger,
                  paddingHorizontal: RFValue(5),
                }}
              />
            </View>
          </View>
          <View style={{width: '15%'}}>
            <CheckBox
              onPress={() => {
                onAbsentCheck(index, item, item.IsAbsent == '0' ? true : false);
              }}
              title={'Absent'}
              isChecked={item.IsAbsent === '1' ? true : false}
              checkBoxSize={24}
              checkBoxColor={COLORS.danger}
              checkBoxLabelColor={COLORS.danger}
            />
          </View>
        </View>
      </View>
    );
  };

  const onTextChanged = (index, value) => {
    const fData = [...filteredData];
    fData[index] = {
      ...fData[index],
      ObtainedMarks: value,
      ExamStatus: value < parseInt(passMarks) || value === '' ? 'Fail' : 'Pass',
    };
    setFilteredData(fData);
    setData(fData);
  };

  const onAbsentCheck = (index, value, check) => {
    const fData = [...filteredData];
    fData[index] = {
      ...fData[index],
      IsAbsent: check ? '1' : '0',
      ObtainedMarks: check ? '0' : value.ObtainedMarks,
      ExamStatus: check
        ? 'Absent'
        : parseInt(fData[index].ObtainedMarks) < passMarks
        ? 'Fail'
        : 'Pass',
    };
    setFilteredData(fData);
    setData(fData);
  };

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = () => {
    setVisible(false);
    onSubmit();
  };

  return (
    <>
      <SafeAreaView style={Styles.statusBarSafeArea} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Styles.safeArea_}>
        <Header
          navigation={props.navigation}
          title={'Create Test'}
          showBackButton={true}
          showDrawerBtn={false}
          showRightBtn={true}
          onBackPress={() => {
            clearFields();
            props.navigation.goBack();
          }}
          onRightBtnPress={showDialog}
        />
        <ScrollView>
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
                  <AppText
                    children={'Test Type'}
                    style={{color: COLORS.primary}}
                  />
                  <DropDown
                    data={examTypes}
                    label="Select Type"
                    value={selectedExamType}
                    onSelect={onSelectExamType()}
                  />
                  {testTypeErrorV && <ErrorMessage message={testTypeErr} />}
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
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Test Name'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  name="testName"
                  keyboardType="default"
                  returnKeyType="next"
                  placeholder="Test Name"
                  value={testName}
                  onChangeText={onTestNameChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
                {testNameErrorV && <ErrorMessage message={testNameErr} />}
              </View>
              <Pressable
                onPress={() => {
                  showDatePicker();
                }}
                style={Styles.t_exam_detail_date_cont}>
                <AppText
                  children={'Date'}
                  style={Styles.t_exam_detail_field_title}
                />
                <AppText
                  children={date ? date : 'Select Date'}
                  style={Styles.date_view_text}
                />
              </Pressable>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Total Marks'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  name="totalMarks"
                  keyboardType="number-pad"
                  returnKeyType="next"
                  placeholder="Total Marks"
                  value={totalMarks}
                  onChangeText={onTotalMarksChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
                {totalMarksErrorV && <ErrorMessage message={totalMarksErr} />}
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Passing Marks'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  name="passMarks"
                  keyboardType="number-pad"
                  returnKeyType="next"
                  placeholder="Pass Marks"
                  value={passMarks}
                  onChangeText={onPassMarksChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
                {passMarksErrorV && <ErrorMessage message={passMarksErr} />}
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Description'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  name="desc"
                  keyboardType="default"
                  returnKeyType="next"
                  placeholder="Description"
                  value={desc}
                  multiline
                  onChangeText={onDescChange}
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
                      width: '25%',
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
                      width: '25%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CheckBox
                      onPress={() => {
                        setFilterVal('Absent');
                        filterStudents('Absent');
                      }}
                      title={'Absent'}
                      isChecked={filterVal == 'Absent' ? true : false}
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
                        setFilterVal('Fail');
                        filterStudents('Fail');
                      }}
                      title={'Fail'}
                      isChecked={filterVal == 'Fail' ? true : false}
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
                        setFilterVal('Pass');
                        filterStudents('Pass');
                      }}
                      title={'Pass'}
                      isChecked={filterVal == 'Pass' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.primary}
                      checkBoxLabelColor={COLORS.primary}
                    />
                  </View>
                </View>
              </View>
            </View>
            {filteredData.length > 0 ? (
              <FlatList
                contentContainerStyle={{
                  alignItems: 'center',
                }}
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                  <View style={{height: tabBarHeight + RFValue(25)}} />
                }
              />
            ) : (
              <View style={{flex: 1}}>
                <Image source={IMAGES.noData} style={Styles.noDataImg3} />
              </View>
            )}
          </View>
        </ScrollView>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Exam</Dialog.Title>
          <Dialog.Description>
            Do you want to proceed with marked Exam?.
          </Dialog.Description>
          <Dialog.Button label="No" onPress={handleCancel} />
          <Dialog.Button label="Yes" onPress={handleCreate} />
        </Dialog.Container>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={date_ => pickADate(date_)}
          onCancel={hideDatePicker}
        />
      </KeyboardAvoidingView>
      {loader ? <Loader /> : null}
    </>
  );
}

export default TExamCreate;
