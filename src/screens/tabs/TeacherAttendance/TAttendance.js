import React, {useState, useEffect} from 'react';
import {Image, Pressable, RefreshControl, View} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useDispatch, useSelector} from 'react-redux';
import {FloatingAction} from 'react-native-floating-action';
import Dialog from 'react-native-dialog';

import moment from 'moment';

import {
  Screen,
  Header,
  Loader,
  AppText,
  DropDown,
  TeacherAttendanceList,
} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {FloatingBtnActions} from '../../../data';
import {setTeacherAttendanceRes} from '../../../redux/tabs/tabSlice';
import {Styles} from '../../../styles';
import {postApiCall} from '../../../services/ApiServices';
import {Commons} from '../../../utils';
import {logout} from '../../../redux/auth/authSlice';
import {ScrollView} from 'react-native-gesture-handler';

function TAttendance(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dateCheck, setDateCheck] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      getAttendances();
      setFromDate('');
      setToDate('');
      setSelectedSubject(null);
    });
    return unsubscribe;
  }, [props.navigation]);

  const onRefresh = () => {
    getAttendances();
  };

  useEffect(() => {
    if (fromDate !== '' && toDate !== '' && selectedSubject !== '') {
      filterExamItems(selectedSubject, fromDate, toDate);
    } else if (fromDate !== '' && toDate !== '') {
      filterExamItems('', fromDate, toDate);
    }
  }, [fromDate, toDate]);

  const filterExamItems = (text, from, to) => {
    if (text || from || to) {
      const newData = data.filter(item => {
        const subjectName = `${item.Subject} - ${item.Class}`;
        const timeStamp = moment(item.Timestamp).format('yyyy-MM-DD');
        if (text !== null && from !== '' && to !== '') {
          return (
            subjectName.indexOf(text) > -1 &&
            timeStamp >= moment(from).format('yyyy-MM-DD') &&
            timeStamp <= moment(to).format('yyyy-MM-DD')
          );
        } else if (from !== '' && to !== '' && text === null) {
          return (
            timeStamp >= moment(from).format('yyyy-MM-DD') &&
            timeStamp <= moment(to).format('yyyy-MM-DD')
          );
        } else if (text !== null && from === '' && to === '') {
          return subjectName.indexOf(text) > -1;
        }
      });
      setFilteredData(newData);
    } else {
      setFilteredData(data);
    }
  };

  const getAttendances = () => {
    setRefreshing(true);
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      Timestamp: Date.now(),
      UpdatedOn: user.UpdatedOn,
    };
    postApiCall(END_POINT.T_ATTENDANCE, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length == 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            setSubjects(Commons.subjectsArray(res.Data.Subjects));
            setData(res.Data.Attendances);
            setFilteredData(res.Data.Attendances);
            dispatch(setTeacherAttendanceRes(res.Data));
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

  function onSelectSubject() {
    return obj => {
      if (fromDate !== '' && toDate !== '') {
        filterExamItems(obj.item, fromDate, toDate);
      } else {
        filterExamItems(obj.item, '', '');
      }
      setSelectedSubject(obj.item);
    };
  }

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Attendance'}
          showBackButton={false}
          showDrawerBtn={true}
          onDrawerPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <View style={Styles.test_main_cont}>
          <View style={Styles.subjectDropDownCont}>
            <View style={Styles.subjectDropDownStyles}>
              <AppText
                children={'Class/Subject'}
                style={{color: COLORS.primary}}
              />
              <DropDown
                data={subjects}
                label="Select Class/Subject"
                value={selectedSubject}
                onSelect={onSelectSubject()}
                contStyle={{borderBottomColor: COLORS.black}}
              />
            </View>
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
          {filteredData.length > 0 ? (
            <TeacherAttendanceList
              data={filteredData}
              refreshing={refreshing}
              onRefresh={onRefresh}
              instance={props}
            />
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  //refresh control used for the Pull to Refresh
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }>
              <View style={{flex: 1}}>
                <Image source={IMAGES.noData} style={Styles.noDataImg2} />
              </View>
            </ScrollView>
          )}
        </View>
        {user.AddAttendance == 1 && (
          <FloatingAction
            actions={FloatingBtnActions}
            color={COLORS.primary}
            onPressItem={name => {
              if (name === 'bt_create') {
                Commons.navigate(props.navigation, ROUTES.T_ATTENDANCE_CREATE);
              }
            }}
          />
        )}
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

export default TAttendance;
