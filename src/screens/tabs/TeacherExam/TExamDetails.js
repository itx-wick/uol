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

import {
  Header,
  Loader,
  AppText,
  ErrorMessage,
  CheckBox,
} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {setLoader} from '../../../redux/common/commonSlice';
import {Styles} from '../../../styles';
import {postApiCall} from '../../../services/ApiServices';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {validateInput} from '../../../utils/Validation';
import {Commons} from '../../../utils';
import {logout} from '../../../redux/auth/authSlice';

function TExamDetails(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const examDetails = useSelector(state => state.Tab.teacherExamDetails);
  const tExamID = useSelector(state => state.Tab.tExamID);

  const [date, setDate] = useState('');
  const [examID, setExamID] = useState('');
  const [testName, setTestName] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [passMarks, setPassMarks] = useState('');
  const [desc, setDesc] = useState('');
  const [testNameErr, setTestNameErr] = useState('');
  const [totalMarksErr, setTotalMarksErr] = useState('');
  const [passMarksErr, setPassMarksErr] = useState('');
  const [descErr, setDescErr] = useState('');
  const [testNameErrorV, setTestNameErrorV] = useState(false);
  const [totalMarksErrorV, setTotalMarksErrorV] = useState(false);
  const [passMarksErrorV, setPassMarksErrorV] = useState(false);
  const [descErrorV, setDescErrorV] = useState(false);
  const [filterVal, setFilterVal] = useState('All');
  const [visible, setVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    getExamDetailData();
  }, [examDetails]);

  const getExamDetailData = () => {
    setExamID(tExamID);
    setData(examDetails.Students);
    setFilteredData(examDetails.Students);
    setDate(
      examDetails.Date !== undefined ||
        examDetails.Date !== null ||
        examDetails.Date !== ''
        ? moment(examDetails.Date).format('DD/MM/yyyy')
        : 'N/A',
    );
    setTestName(
      examDetails.Title !== undefined ||
        examDetails.Title !== null ||
        examDetails.Title !== ''
        ? examDetails.Title
        : 'N/A',
    );
    setTotalMarks(
      examDetails.TotalMarks !== undefined ||
        examDetails.TotalMarks !== null ||
        examDetails.TotalMarks !== ''
        ? examDetails.TotalMarks
        : 'N/A',
    );
    setPassMarks(
      examDetails.PassMarks !== undefined ||
        examDetails.PassMarks !== null ||
        examDetails.PassMarks !== ''
        ? examDetails.PassMarks
        : 'N/A',
    );
    setDesc(
      examDetails.Description !== undefined ||
        examDetails.Description !== null ||
        examDetails.Description !== ''
        ? examDetails.Description
        : 'N/A',
    );
  };

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
    setDescErr('');
    setDescErrorV(false);
  };

  const filterStudents = text => {
    const newData = data.filter(item => {
      const itemData = item.ExamStatus;
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
        IsAbsent: data[i].IsAbsent == '0' ? false : true,
        ObtainedMarks: data[i].ObtainedMarks,
      };
      students.push(entry);
    }
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      ExamID: examID,
      Date: date,
      TotalMarks: totalMarks,
      PassMarks: passMarks,
      Title: testName,
      Description: desc,
      Students: students,
    };
    postApiCall(END_POINT.T_EXAM_UPDATE, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
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

  const showDialog = () => {
    {
      user.EditExams == 1 && setVisible(true);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleUpdate = () => {
    setVisible(false);
    onUpdate();
  };

  const renderItem = ({item, index}) => {
    console.log(JSON.stringify(item, null, 2));
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
                editable={
                  item.IsAbsent === '1'
                    ? false
                    : user.EditExams == 1
                    ? true
                    : false
                }
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
                {
                  user.EditExams == 1 &&
                    onAbsentCheck(
                      index,
                      item,
                      item.IsAbsent == '0' ? true : false,
                    );
                }
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

  return (
    <>
      <SafeAreaView style={Styles.statusBarSafeArea} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Styles.safeArea_}>
        <Header
          navigation={props.navigation}
          title={'Test Details'}
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
                  value={`${examDetails.Subject}`}
                  editable={false}
                  style={Styles.t_exam_detail_field_data}
                />
              </View>
              <View style={Styles.t_exam_detail_field_view}>
                <AppText
                  children={'Test Type'}
                  style={Styles.t_exam_detail_field_title}
                />
                <TextInput
                  value={`${examDetails.TestType}`}
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
                  value={`${examDetails.Batch}`}
                  editable={false}
                  style={Styles.t_exam_detail_field_data}
                />
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
                  {
                    user.EditExams == 0 && showDatePicker();
                  }
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
                  editable={user.EditExams == 1 ? true : false}
                  onChangeText={onTotalMarksChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
                {testNameErrorV && <ErrorMessage message={testNameErr} />}
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
                  editable={user.EditExams == 1 ? true : false}
                  onChangeText={onPassMarksChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
                {testNameErrorV && <ErrorMessage message={testNameErr} />}
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
                  editable={user.EditExams == 1 ? true : false}
                  onChangeText={onDescChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.t_exam_detail_field_data}
                />
                {testNameErrorV && <ErrorMessage message={testNameErr} />}
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
          <Dialog.Title>Exam</Dialog.Title>
          <Dialog.Description>
            Do you want to update the Test?.
          </Dialog.Description>
          <Dialog.Button label="No" onPress={handleCancel} />
          <Dialog.Button label="Yes" onPress={handleUpdate} />
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

export default TExamDetails;
