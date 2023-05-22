import React from 'react';
import {Image, Platform} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';

import {
  Accounts,
  Announcements,
  About,
  ChangePassword,
  AddChild,
} from '../screens';
import {IMAGES, COLORS, ROUTES} from '../constants';
import BottomTabNavigator from './BottomTabNavigator';
import {CustomDrawer} from '../components';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: COLORS.primary,
        drawerActiveTintColor: COLORS.white,
        drawerLabelStyle: {
          marginLeft: -25,
        },
      }}>
      <Drawer.Screen
        name={ROUTES.B_HOME}
        component={BottomTabNavigator}
        options={{
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
      <Drawer.Screen
        name={ROUTES.ANNOUNCEMENT}
        component={Announcements}
        options={{
          drawerIcon: ({color, size, focused}) => {
            return (
              <Image
                source={IMAGES.timetable}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: focused ? COLORS.white : COLORS.black,
                }}
              />
            );
          },
          drawerItemStyle: {
            borderTopWidth: Platform.OS === 'ios' ? RFValue(0.5) : RFValue(1),
            borderBottomWidth:
              Platform.OS === 'ios' ? RFValue(0.5) : RFValue(1),
            borderRadius: 0,
            borderTopColor: COLORS.gray,
            borderBottomColor: COLORS.gray,
            paddingVertical: RFValue(10),
          },
        }}
      />

      {user.showAccounts === 1 && (
        <Drawer.Screen
          name={ROUTES.ACCOUNTS}
          component={Accounts}
          options={{
            drawerIcon: ({color, size, focused}) => {
              return (
                <Image
                  source={IMAGES.accounting}
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: focused ? COLORS.white : COLORS.black,
                  }}
                />
              );
            },
          }}
        />
      )}
      <Drawer.Screen
        name={ROUTES.ABOUT_US}
        component={About}
        options={{
          drawerIcon: ({color, size, focused}) => {
            return (
              <Image
                source={IMAGES.about}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: focused ? COLORS.white : COLORS.black,
                }}
              />
            );
          },
        }}
      />
      {userType != 'S' && userType != 'T' && (
        <Drawer.Screen
          name={ROUTES.ADD_CHILD}
          component={AddChild}
          options={{
            drawerIcon: ({color, size, focused}) => {
              return (
                <Image
                  source={IMAGES.add_child}
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: focused ? COLORS.white : COLORS.black,
                  }}
                />
              );
            },
          }}
        />
      )}
      <Drawer.Screen
        name={ROUTES.CHANGE_PASSWORD}
        component={ChangePassword}
        options={{
          drawerIcon: ({color, size, focused}) => {
            return (
              <Image
                source={IMAGES.resetPwd}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: focused ? COLORS.white : COLORS.black,
                }}
              />
            );
          },
        }}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
