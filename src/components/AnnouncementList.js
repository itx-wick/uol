import React from 'react';
import {View, Pressable, FlatList, RefreshControl} from 'react-native';
import moment from 'moment';

import {RFValue} from 'react-native-responsive-fontsize';
import {Commons} from '../utils';
import {COLORS, ROUTES} from '../constants';
import AppText from './AppText';
import {Styles} from '../styles';
import Icon from './Icon';

const AnnouncementList = props => {
  const ListItem = ({announcement, index, instance}) => (
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
          ROUTES.ANNOUNCEMENT_DETAILS,
          {
            details: announcement,
          },
        );
      }}>
      <View style={{width: '50%'}}>
        <AppText
          children={announcement.Title}
          style={{fontWeight: 'bold', color: COLORS.black}}
        />
        <AppText
          children={announcement.StartDate}
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
            ROUTES.ANNOUNCEMENT_DETAILS,
            {
              details: announcement,
            },
          );
        }}
      />
    </Pressable>
  );

  const renderItem = ({item, index}) => (
    <ListItem announcement={item} index={index} instance={props.instance} />
  );

  return (
    <FlatList
      contentContainerStyle={{
        alignItems: 'center',
      }}
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
      ListFooterComponent={<View style={{height: RFValue(25)}} />}
    />
  );
};

export default AnnouncementList;
