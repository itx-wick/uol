import {View, Image} from 'react-native';
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {useDispatch, useSelector} from 'react-redux';

import {COLORS, IMAGES, ROUTES} from '../constants';
import {Commons} from '../utils';
import AppText from './AppText';
import {Styles} from '../styles';
import {logout} from '../redux/auth/authSlice';

function CustomDrawer(props) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.User.currentUser);
  return (
    <DrawerContentScrollView {...props}>
      <View style={Styles.drawerTopContentView}>
        <>
          {user.ProfilePic && user.ProfilePic !== '' ? (
            <Image source={{uri: user.ProfilePic}} style={Styles.userImage} />
          ) : (
            <View style={Styles.userInitials}>
              <AppText
                style={Styles.userInitialsText}
                children={Commons.getInitials(
                  user.FirstName + ' ' + user.LastName,
                )}
              />
            </View>
          )}
        </>
        <AppText
          children={user.FirstName + ' ' + user.LastName}
          numberOfLines={1}
          style={Styles.drawerUserName}
        />
      </View>
      <View>
        <DrawerItemList {...props} />
      </View>
      <DrawerItem
        labelStyle={{marginLeft: -25}}
        icon={({focused, color, size}) => (
          <Image
            source={IMAGES.logout}
            style={{
              width: 22,
              height: 22,
              tintColor: focused ? COLORS.white : COLORS.black,
            }}
          />
        )}
        label="Logout"
        onPress={() => {
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        }}
      />
    </DrawerContentScrollView>
  );
}

export default CustomDrawer;
