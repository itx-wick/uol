import React, {useEffect} from 'react';
import {Image, RefreshControl, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {Screen, Header, Loader, AnnouncementList} from '../../components';
import {setEvents} from '../../redux/drawer/drawerSlice';
import {Styles} from '../../styles';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../constants';
import {Commons} from '../../utils';
import {postApiCall} from '../../services/ApiServices';
import {logout} from '../../redux/auth/authSlice';
import {ScrollView} from 'react-native-gesture-handler';

function Announcement(props) {
  const dispatch = useDispatch();
  const eventsList = useSelector(state => state.Drawer.events);
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const [refreshing, setRefreshing] = React.useState(false);

  // useEffect(() => {
  //   const unsubscribe = props.navigation.addListener('focus', () => {
  //     getEvents();
  //   });
  //   return unsubscribe;
  // }, [props.navigation]);

  useEffect(() => {
    getEvents();
  }, []);

  const onRefresh = () => {
    getEvents();
  };

  const getEvents = () => {
    setRefreshing(true);
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
    };
    let endPoint = data.Type === 'T' ? END_POINT.T_EVENTS : END_POINT.U_EVENTS;
    postApiCall(endPoint, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            dispatch(setEvents(res.Data.Events));
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
          title={'Announcements'}
          showBackButton={true}
          showDrawerBtn={false}
          onBackPress={() => {
            props.navigation.goBack();
          }}
        />
        <View style={Styles.announcement_main_cont}>
          {eventsList.length > 0 ? (
            <AnnouncementList
              data={eventsList}
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
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default Announcement;
