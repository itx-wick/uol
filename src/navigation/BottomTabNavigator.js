import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image} from 'react-native';
import {useSelector} from 'react-redux';

import {
  Home,
  Timetable,
  Notifications,
  Tests,
  Attendance,
  TestDetails,
  AttendanceDetails,
  THome,
  TExams,
  TExamDetails,
  TExamCreate,
  CreateNotifications,
  NotificationDetails,
  TAttendance,
  TAttendanceDetails,
  TAttendanceCreate,
  MarkScheduledAttendance,
} from '../screens';

import {ROUTES, IMAGES, COLORS} from '../constants';
import {RFValue} from 'react-native-responsive-fontsize';

const Tab = createBottomTabNavigator();

const AttendanceStack = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.ATTENDANCE}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {display: 'none'},
      }}>
      <Tab.Screen
        name={ROUTES.ATTENDANCE}
        component={Attendance}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.ATTENDANCE_DETAILS}
        component={AttendanceDetails}
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const UserExamStack = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.TESTS}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {display: 'none'},
      }}>
      <Tab.Screen
        name={ROUTES.TESTS}
        component={Tests}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.TEST_DETAILS}
        component={TestDetails}
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const TeacherExamStack = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.T_EXAMS}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {display: 'none'},
      }}>
      <Tab.Screen
        name={ROUTES.T_EXAMS}
        component={TExams}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.T_EXAM_DETAILS}
        component={TExamDetails}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.T_EXAM_CREATE}
        component={TExamCreate}
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const NotificationStack = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.NOTIFICATIONS}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {display: 'none'},
      }}>
      <Tab.Screen
        name={ROUTES.NOTIFICATIONS}
        component={Notifications}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.NOTIFICATION_DETAILS}
        component={NotificationDetails}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.CREATE_NOTIFICATION}
        component={CreateNotifications}
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const TeacherAttendanceStack = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.T_ATTENDANCE}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {display: 'none'},
      }}>
      <Tab.Screen
        name={ROUTES.T_ATTENDANCE}
        component={TAttendance}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.T_ATTENDANCE_CREATE}
        component={TAttendanceCreate}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.MARK_S_ATTENDANCE}
        component={MarkScheduledAttendance}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={ROUTES.T_ATTENDANCE_DETAILS}
        component={TAttendanceDetails}
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

function BottomTabNavigator() {
  const userType = useSelector(state => state.Common.userType);
  return (
    <>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarStyle: {
            paddingTop: RFValue(5),
          },
          tabBarIcon: ({color, size, focused}) => {
            let iconName;
            let iconColor;
            if (route.name === ROUTES.HOME) {
              iconName = IMAGES.home;
              iconColor = focused ? COLORS.primary : COLORS.black;
            } else if (route.name === ROUTES.TIMETABLE) {
              iconName = IMAGES.timetable;
              iconColor = focused ? COLORS.primary : COLORS.black;
            } else if (route.name === ROUTES.NOTIFICATIONS) {
              iconName = IMAGES.notifications;
              iconColor = focused ? COLORS.primary : COLORS.black;
            } else if (route.name === ROUTES.TESTS) {
              iconName = IMAGES.test;
              iconColor = focused ? COLORS.primary : COLORS.black;
            } else if (route.name === ROUTES.ATTENDANCE) {
              iconName = IMAGES.attendance;
              iconColor = focused ? COLORS.primary : COLORS.black;
            }
            return (
              <Image
                source={iconName}
                style={{height: 24, width: 24, tintColor: iconColor}}
              />
            );
          },
        })}>
        {userType !== 'T' ? (
          <Tab.Screen name={ROUTES.HOME} component={Home} option />
        ) : (
          <Tab.Screen name={ROUTES.T_HOME} component={THome} option />
        )}
        <Tab.Screen name={ROUTES.TIMETABLE} component={Timetable} />
        <Tab.Screen name={ROUTES.NOTIFICATIONS} component={NotificationStack} />
        {userType !== 'T' ? (
          <Tab.Screen name={ROUTES.TESTS} component={UserExamStack} />
        ) : (
          <Tab.Screen name={ROUTES.T_EXAMS} component={TeacherExamStack} />
        )}
        {userType !== 'T' ? (
          <Tab.Screen name={ROUTES.ATTENDANCE} component={AttendanceStack} />
        ) : (
          <Tab.Screen
            name={ROUTES.T_ATTENDANCE}
            component={TeacherAttendanceStack}
          />
        )}
      </Tab.Navigator>
    </>
  );
}

export default BottomTabNavigator;
