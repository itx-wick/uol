import React from 'react';
import {
  View,
  Pressable,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import moment from 'moment';
const {width, height} = Dimensions.get('window');
import {RFValue} from 'react-native-responsive-fontsize';
import {Commons} from '../utils';
import {COLORS, ROUTES} from '../constants';
import AppText from './AppText';
import {Styles} from '../styles';
import Icon from './Icon';

const NotificationsList = props => {
  const tabBarHeight = useBottomTabBarHeight();

  const ListItem = ({notification, index, instance}) => (
    <Pressable
      style={[
        Styles.announcement_list_item_card,
        {
          marginTop: index === 0 ? RFValue(5) : RFValue(0),
        },
      ]}
      onPress={() => {
        Commons.navigateParams(
          instance.navigation,
          ROUTES.NOTIFICATION_DETAILS,
          {
            details: notification,
          },
        );
      }}>
      <View>
        <AppText
          children={notification.Title}
          numberOfLines={1}
          style={{
            fontWeight: 'bold',
            color: COLORS.black,
            width: width * 0.8,
          }}
        />
        <AppText
          children={moment(notification.CreatedOn)
            .utc()
            .format('DD MMM yyyy HH:mm')}
          style={{color: COLORS.black}}
        />
      </View>
      <Icon
        iconType={'materialCommunity'}
        icon="chevron-right"
        iconSize={30}
        iconColor={COLORS.black}
        onClick={() => {
          Commons.navigateParams(
            instance.navigation,
            ROUTES.NOTIFICATION_DETAILS,
            {
              details: notification,
            },
          );
        }}
      />
    </Pressable>
  );

  const renderItem = ({item, index}) => (
    <ListItem notification={item} index={index} instance={props.instance} />
  );

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={props.data}
      renderItem={renderItem}
      keyExtractor={({item, index}) => index}
      refreshControl={
        <RefreshControl
          //refresh control used for the Pull to Refresh
          refreshing={props.refreshing}
          onRefresh={props.onRefresh}
        />
      }
      ListFooterComponent={<View style={{height: RFValue(60)}} />}
    />
  );
};

export default NotificationsList;
