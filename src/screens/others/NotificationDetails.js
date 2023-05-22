import React from 'react';
import {useWindowDimensions, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {Screen, Header, Loader, AppText} from '../../components';
import {Styles} from '../../styles';
import {RFValue} from 'react-native-responsive-fontsize';
import CardView from 'react-native-cardview';
import RenderHtml from 'react-native-render-html';
import {COLORS} from '../../constants';

function NotificationDetails(props) {
  const dispatch = useDispatch();
  const paramData = props.route.params.details;
  const loader = useSelector(state => state.Common.loader);

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      console.log(JSON.stringify(paramData, null, 2));
    });
    return unsubscribe;
  }, [props.navigation]);

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

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Notification Details'}
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
                  <View style={Styles.event_detail_date}>
                    <AppText
                      children={'Title: '}
                      numberOfLines={1}
                      style={{
                        width: RFValue(50),
                        fontWeight: 'bold',
                        color: COLORS.black,
                      }}
                    />
                    <AppText
                      children={paramData.Title}
                      // numberOfLines={1}
                      style={Styles.event_detail_title}
                    />
                  </View>
                  <View style={Styles.event_detail_date}>
                    <AppText
                      children={'Date:'}
                      numberOfLines={1}
                      style={{
                        width: RFValue(50),
                        fontWeight: 'bold',
                        color: COLORS.black,
                      }}
                    />
                    <AppText
                      children={paramData.CreatedOn}
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

export default NotificationDetails;
