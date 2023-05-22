import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Screen,
  Header,
  Loader,
  AppText,
  DropDown,
  VoucherList,
} from '../../components';
import { Styles } from '../../styles';
import { COLORS, END_POINT, IMAGES, ROUTES } from '../../constants';
import { Commons } from '../../utils';
import { postApiCall } from '../../services/ApiServices';
import { logout } from '../../redux/auth/authSlice';
import { ScrollView } from 'react-native-gesture-handler';
import { VoucherFilter } from '../../data';
import { setLoader } from '../../redux/common/commonSlice';

function Accounts(props) {
  const dispatch = useDispatch();

  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const { width, height } = Dimensions.get('screen');
  const [fromDate, setFromDate] = useState(
    moment(Commons.subtractMonths(new Date(Date.now()), 6)).format(
      'YYYY-MM-DD',
    ),
  );
  const [toDate, setToDate] = useState(moment(Date.now()).format('YYYY-MM-DD'));
  const [voucherFilters, setVoucherFilters] = useState(VoucherFilter);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [dateCheck, setDateCheck] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState([]);

  useEffect(() => {
    if (fromDate != '' && toDate != '') {
      getVouchers(selectedFilter);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setSelectedFilter('All');
      getVouchers(selectedFilter);
    });
    return unsubscribe;
  }, [props.navigation]);

  const onRefresh = () => {
    getVouchers(selectedFilter);
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

  function onSelectFilter() {
    return obj => {
      setSelectedFilter(obj.item);
      getVouchers(obj.item);
    };
  }

  const getVouchers = val => {
    setRefreshing(true);
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      RollNo: user.RollNo,
      LedgerType: val != null ? val : 'All',
      StartDate: fromDate,
      EndDate: toDate,
      Type: userType,
    };
    postApiCall(END_POINT.GET_VOUCHERS, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length == 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            if (res.Data.ledgers.length === 0) {
              data.splice(0, data.length);
            } else {
              setData(res.Data.ledgers);
            }
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

  const getInvoice = item => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      Type: userType,
      APIAccessToken: user.APIAccessToken,
      orientation: 'L',
      invoice_id: item.InvID,
      invoice_type: item.InvType,
      StartDate: fromDate,
      EndDate: toDate,
    };
    postApiCall(END_POINT.GET_INVOICE, params)
      .then(res => {
        openInvoice(res.Data.InvoicePrint.URL);
        dispatch(setLoader(false));
      })
      .catch(err => {
        console.warn(err);
        dispatch(setLoader(false));
      });
  };

  const openInvoice = async url => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Accounts'}
          showBackButton={true}
          showDrawerBtn={false}
          onBackPress={() => {
            props.navigation.goBack();
          }}
        />
        <View style={Styles.announcement_main_cont}>
          <View style={Styles.subjectDropDownCont}>
            <View style={Styles.subjectDropDownStyles}>
              <AppText
                children={'Filter Vouchers'}
                style={{ color: COLORS.primary }}
              />
              <DropDown
                data={voucherFilters}
                label="Select Filter"
                value={selectedFilter}
                onSelect={onSelectFilter()}
                contStyle={{ borderBottomColor: COLORS.black }}
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
          {data.length > 0 ? (
            <VoucherList
              data={data}
              refreshing={refreshing}
              onRefresh={onRefresh}
              fetchInvoice={getInvoice}
              instance={props}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  //refresh control used for the Pull to Refresh
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }>
              <View
                style={{
                  flex: 1,
                  width: width,
                  height: height,
                  alignItems: 'center',
                }}>
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
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default Accounts;
