import React from 'react';
import {useWindowDimensions, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import RenderHtml from 'react-native-render-html';
import {Screen, Header, Loader, AppText, AppButton} from '../../components';
import {setLoader} from '../../redux/common/commonSlice';
import {Styles} from '../../styles';
import {RFValue} from 'react-native-responsive-fontsize';
import CardView from 'react-native-cardview';
import {COLORS, END_POINT, ROUTES} from '../../constants';
import {postApiCall} from '../../services/ApiServices';
import {logout} from '../../redux/auth/authSlice';
import {Commons} from '../../utils';

function AnnouncementDetails(props) {
  const dispatch = useDispatch();
  const paramData = props.route.params.details;
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const [status, setStatus] = React.useState(paramData.Status);
  React.useEffect(() => {
    setStatus(paramData.Status);
  }, [paramData]);

  const {width} = useWindowDimensions();
  const source = {
    html: paramData.Body,
  };
  const tagsStyles = {
    p: {
      color: 'black',
    },
    strong: {
      color: 'black',
    },
    h: {
      color: 'black',
    },
    h1: {
      color: 'black',
    },
    h2: {
      color: 'black',
    },
    h3: {
      color: 'black',
    },
    h4: {
      color: 'black',
    },
    h5: {
      color: 'black',
    },
    h6: {
      color: 'black',
    },
    li: {
      color: 'black',
    },
    ol: {
      color: 'black',
    },
    ul: {
      color: 'black',
    },
    em: {
      color: 'black',
    },
    img: {
      width: '85%',
    },
  };

  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true,
    },
  };

  const submitConsent = () => {
    dispatch(setLoader(true));
    let data = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      EventID: paramData.ID,
      ConsentType: paramData.ConsentType,
    };
    postApiCall(END_POINT.SUBMIT_CONSENT, data)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            setStatus(!status);
            Commons.snackBar(res.Message, COLORS.green);
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

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Announcement Details'}
          showBackButton={true}
          showDrawerBtn={false}
          onBackPress={() => {
            props.navigation.goBack();
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={Styles.announcement_main_cont}>
            <CardView
              cardElevation={RFValue(1)}
              cardMaxElevation={RFValue(5)}
              style={Styles.announcement_detail_card_view}>
              <View style={Styles.announcement_detail_main_view}>
                <View>
                  <AppText
                    children={paramData.Title}
                    style={Styles.event_detail_title}
                  />
                  <View style={Styles.event_detail_date}>
                    <AppText
                      children={'From:'}
                      numberOfLines={1}
                      style={{
                        width: RFValue(50),
                        color: COLORS.black,
                      }}
                    />
                    <AppText
                      children={paramData.StartDate}
                      numberOfLines={1}
                      style={{
                        fontSize: RFValue(12),
                        color: COLORS.black,
                      }}
                    />
                  </View>
                  <View style={Styles.event_detail_date}>
                    <AppText
                      children={'To: '}
                      numberOfLines={1}
                      style={{width: RFValue(50), color: COLORS.black}}
                    />
                    <AppText
                      children={paramData.EndDate}
                      numberOfLines={1}
                      style={{
                        fontSize: RFValue(12),
                        color: COLORS.black,
                      }}
                    />
                  </View>
                  <AppText
                    children={'Description'}
                    numberOfLines={1}
                    style={Styles.event_detail_desc_title}
                  />
                </View>

                <View style={Styles.event_interested_btn}>
                  {!status && paramData.ConsentType == '1' ? (
                    <AppButton
                      title={'Interested'}
                      titleStyle={{
                        fontSize: RFValue(10),
                      }}
                      btnStyle={{
                        backgroundColor: COLORS.primary,
                        padding: RFValue(10),
                      }}
                      onPress={submitConsent}
                    />
                  ) : status && paramData.ConsentType == '1' ? (
                    <AppButton
                      title={'Interested'}
                      titleStyle={{
                        fontSize: RFValue(10),
                        color: COLORS.white,
                      }}
                      btnStyle={{
                        backgroundColor: COLORS.gray,
                        padding: RFValue(10),
                      }}
                    />
                  ) : null}
                  {!status && paramData.ConsentType == '2' ? (
                    <AppButton
                      title={'Not Interested'}
                      titleStyle={{
                        fontSize: RFValue(10),
                      }}
                      btnStyle={{
                        backgroundColor: COLORS.primary,
                        padding: RFValue(10),
                      }}
                      onPress={submitConsent}
                    />
                  ) : status && paramData.ConsentType == '2' ? (
                    <AppButton
                      title={'Not Interested'}
                      titleStyle={{
                        fontSize: RFValue(10),
                      }}
                      btnStyle={{
                        backgroundColor: COLORS.gray,
                        padding: RFValue(10),
                      }}
                    />
                  ) : null}
                </View>
              </View>
              <View style={Styles.event_desc_divider} />
              <RenderHtml
                contentWidth={width}
                source={source}
                tagsStyles={tagsStyles}
                renderersProps={renderersProps}
              />
            </CardView>
          </View>
        </ScrollView>
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default AnnouncementDetails;
