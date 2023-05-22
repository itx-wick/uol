import React from 'react';
import { useWindowDimensions, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { RFValue } from 'react-native-responsive-fontsize';
import { WeeklyTimetable, MonthlyTimetable } from '../../screens';
import { Screen, Header, Loader } from '../../components';

import { COLORS } from '../../constants';

function Timetable(props) {
  const dispatch = useDispatch();
  const layout = useWindowDimensions();
  const loader = useSelector(state => state.Common.loader);

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'weekly', title: 'Weekly' },
    { key: 'monthly', title: 'Monthly' },
  ]);

  const renderScene = SceneMap({
    weekly: WeeklyTimetable,
    monthly: MonthlyTimetable,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      activeColor={'black'}
      inactiveColor={'black'}
      style={{ backgroundColor: 'white' }}
      renderLabel={_renderLabel}
      indicatorStyle={{ backgroundColor: COLORS.primary, height: RFValue(3) }}
    />
  );

  const _renderLabel = ({ route, focused }) => {
    if (focused) {
      return (
        <Text
          style={{
            color: COLORS.primary,
            fontSize: RFValue(14),
            minWidth: RFValue(100),
            textAlign: 'center',
          }}>
          {' '}
          {route.title}{' '}
        </Text>
      );
    }
    return (
      <Text
        style={{
          color: COLORS.primary,
          fontSize: RFValue(14),
          minWidth: RFValue(100),
          textAlign: 'center',
        }}>
        {' '}
        {route.title}{' '}
      </Text>
    );
  };

  return (
    <>
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Timetable'}
          showBackButton={false}
          showDrawerBtn={true}
          onDrawerPress={() => {
            props.navigation.openDrawer();
          }}
        />
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          indicatorStyle={{
            backgroundColor: COLORS.black,
            height: RFValue(5),
          }}
        />
      </Screen>
      {loader ? <Loader /> : null}
    </>
  );
}

export default Timetable;
