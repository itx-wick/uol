import React, {useState, useEffect} from 'react';
import {Dimensions, Image, Pressable, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Screen,
  Header,
  Loader,
  AppText,
  UserAttendanceList,
} from '../../../components';
import {COLORS, IMAGES} from '../../../constants';
import {Styles} from '../../../styles';
import moment from 'moment';

const {width} = Dimensions.get('window');

function AttendanceDetails(props) {
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userList = useSelector(state => state.Common.usersList);
  const lectureAttendances = useSelector(
    state => state.Tab.lectureAttendanceList,
  );
  const userAttendanceItem = useSelector(state => state.Tab.userAttendanceItem);

  const [fromDate, setFromDate] = useState(
    moment(Date.now()).subtract(6, 'months').format('yyyy-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment(Date.now()).format('yyyy-MM-DD'));
  const [dateCheck, setDateCheck] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [data, setData] = useState(lectureAttendances);
  const [filteredData, setFilteredData] = useState(lectureAttendances);

  useEffect(() => {
    setFilteredData(lectureAttendances);
    setData(lectureAttendances);
  }, [lectureAttendances]);

  useEffect(() => {
    if (fromDate !== '' && toDate !== '') {
      filterSubjectBetweenDates(fromDate, toDate);
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
    let day = tempDate.getDate();
    let fDate = `${year}-${month}-${day}`;
    if (check === 'From') {
      setFromDate(fDate);
    } else {
      setToDate(fDate);
    }
    hideDatePicker();
  };

  const filterSubjectBetweenDates = (from, to) => {
    if (from !== '' && to !== '') {
      const newData = data.filter(item => {
        const itemData = moment(item.Date).format('yyyy-MM-DD');
        return (
          itemData >= moment(from).format('yyyy-MM-DD') &&
          itemData <= moment(to).format('yyyy-MM-DD')
        );
      });
      setFilteredData(newData);
    } else {
      setFilteredData(data);
    }
  };

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Attendance Details'}
          showBackButton={true}
          showDrawerBtn={false}
          onBackPress={() => {
            props.navigation.goBack();
          }}
        />
        <View style={Styles.attendance_main_cont}>
          <View style={Styles.lecture_head_view}>
            <View style={Styles.lecture_head_text_view}>
              <AppText
                children={
                  userAttendanceItem.Subject
                    ? userAttendanceItem.Subject
                    : 'Subject'
                }
                style={{
                  fontSize: RFValue(16),
                  fontWeight: 'bold',
                  color: COLORS.black,
                }}
              />
              <AppText
                children={
                  userAttendanceItem.LectureType
                    ? userAttendanceItem.LectureType
                    : 'Lecture'
                }
                style={{color: COLORS.black}}
              />
            </View>
            <View style={[Styles.dates_cont, {width: width * 0.95}]}>
              <Pressable
                onPress={() => {
                  setDateCheck(true);
                  showDatePicker();
                }}
                style={Styles.from_date_cont}>
                <AppText
                  children={'From Date'}
                  style={Styles.date_view_title}
                />
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
          </View>
          {filteredData.length > 0 ? (
            <UserAttendanceList data={filteredData} instance={props} />
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

export default AttendanceDetails;
