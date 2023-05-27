import React, {useState, useEffect} from 'react';
import {Image, Pressable, RefreshControl, View} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useDispatch, useSelector} from 'react-redux';
import {
  Screen,
  Header,
  Loader,
  AppText,
  UserExamsList,
} from '../../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../../constants';
import {setTestList} from '../../../redux/tabs/tabSlice';
import {Styles} from '../../../styles';
import {postApiCall} from '../../../services/ApiServices';
import {Commons} from '../../../utils';
import {logout} from '../../../redux/auth/authSlice';
import {ScrollView} from 'react-native-gesture-handler';
import moment from 'moment';

function Tests(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const userList = useSelector(state => state.Common.usersList);
  const examsList = useSelector(state => state.Tab.testList);
  const dashStat = useSelector(state => state.Tab.dashStat);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateCheck, setDateCheck] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getTests();
  }, [fromDate, toDate]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setFromDate('');
      setToDate('');
      getTests();
    });
    return unsubscribe;
  }, [props.navigation]);

  const onRefresh = () => {
    getTests();
  };

  const getTests = () => {
    setRefreshing(true);
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      StartDate: fromDate,
      EndDate: toDate,
    };
    postApiCall(END_POINT.U_EXAMS, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            console.log(res.Data);
            dispatch(setTestList(res.Data.Exams));
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

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Tests'}
          showBackButton={false}
          showDrawerBtn={true}
          onDrawerPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <View style={Styles.test_main_cont}>
          <View style={Styles.statHeaderView}>
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
                children={
                  fromDate
                    ? moment(fromDate).format('DD-MM-yyyy')
                    : 'Select Date'
                }
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
                children={
                  toDate ? moment(toDate).format('DD-MM-yyyy') : 'Select Date'
                }
                style={Styles.date_view_text}
              />
            </Pressable>
          </View>
          {examsList.length > 0 ? (
            <UserExamsList
              data={examsList}
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

export default Tests;
