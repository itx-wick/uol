import React, {useState, useEffect} from 'react';
import {Image, Pressable, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useDispatch, useSelector} from 'react-redux';
import {
  Screen,
  Header,
  Loader,
  AppText,
  UserExamDetailList,
} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {Styles} from '../../../styles';
import {postApiCall} from '../../../services/ApiServices';
import {Commons} from '../../../utils';
import {logout} from '../../../redux/auth/authSlice';
import {setTestDetailsList} from '../../../redux/tabs/tabSlice';

function TestDetails(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);
  const examDetailList = useSelector(state => state.Tab.testDetailsList);
  const userExamItem = useSelector(state => state.Tab.userExamItem);
  const dashStat = useSelector(state => state.Tab.dashStat);

  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dateCheck, setDateCheck] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    setData(examDetailList);
  }, [examDetailList]);

  useEffect(() => {
    if (fromDate !== '' && toDate !== '') {
      getTestDetails();
    }
  }, [fromDate, toDate]);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const pickADate = (date, check) => {
    let tempDate = new Date(date);
    let year = tempDate.getFullYear();
    let month = ('0' + (tempDate.getMonth() + 1)).slice(-2);
    let day =
      tempDate.getDate() < 10 ? '0' + tempDate.getDate() : tempDate.getDate();
    let fDate = `${year}-${month}-${day}`;
    if (check === 'From') {
      setFromDate(fDate);
    } else {
      setToDate(fDate);
    }
    hideDatePicker();
  };

  const getTestDetails = () => {
    setRefreshing(true);
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: userExamItem.SubjectID,
      StartDate: fromDate,
      EndDate: toDate,
    };
    postApiCall(END_POINT.U_EXAM_DETAILS, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            console.log('Exam Details List', res.Data);
            setData(res.Data.ExamDetails);
            dispatch(setTestDetailsList(res.Data.ExamDetails));
            Commons.navigate(props.navigation, ROUTES.TEST_DETAILS);
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        setRefreshing(false);
      })
      .catch(err => {
        console.warn(err);
        setRefreshing(false);
      });
  };

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={
            userExamItem.SubjectName
              ? Commons.getWords(userExamItem.SubjectName, 1)
              : 'Subject'
          }
          showBackButton={true}
          showDrawerBtn={false}
          onBackPress={() => {
            props.navigation.goBack();
          }}
        />
        <View style={Styles.test_main_cont}>
          <View style={[Styles.statHeaderView, {marginBottom: RFValue(5)}]}>
            <AppText
              children={
                dashStat.OverallTestPercent === 'undefined' ||
                dashStat.OverallTestPercent === 'null' ||
                dashStat.OverallTestPercent === 'N/A'
                  ? 'Overall Percentage 0%'
                  : 'Overall Percentage ' + dashStat.OverallTestPercent
              }
              style={{color: COLORS.white}}
            />
          </View>
          <View style={Styles.dates_cont}>
            <Pressable
              onPress={() => {
                setDateCheck(true);
                showDatePicker();
              }}
              style={Styles.from_date_cont}>
              <AppText children={'From Date'} style={Styles.date_view_title} />
              <AppText
                children={fromDate ? fromDate : 'Select Date'}
                style={Styles.date_view_text}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setDateCheck(false);
                showDatePicker();
              }}
              style={Styles.to_date_cont}>
              <AppText children={'To Date'} style={Styles.date_view_title} />
              <AppText
                children={toDate ? toDate : 'Select Date'}
                style={Styles.date_view_text}
              />
            </Pressable>
          </View>
          {examDetailList.length > 0 ? (
            <UserExamDetailList
              data={examDetailList}
              instance={props}
              refreshing={refreshing}
            />
          ) : (
            <View style={{flex: 1}}>
              <Image source={IMAGES.noData} style={Styles.noDataImg2} />
            </View>
          )}
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={
            dateCheck
              ? data => pickADate(data, 'From')
              : data => pickADate(data, 'To')
          }
          onCancel={hideDatePicker}
        />
        {userList.length > 1 && (
          <View style={Styles.currentUserView}>
            <AppText
              children={user.FirstName + ' ' + user.LastName + ' '}
              style={{color: COLORS.white}}
            />
          </View>
        )}
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default TestDetails;
