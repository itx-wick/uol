import React, {useEffect} from 'react';
import {persistor, store} from './src/redux/store';
import {LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import StackNavigation from './src/navigation/StackNavigation';
import messaging from '@react-native-firebase/messaging';
import SplashScreen from 'react-native-splash-screen';

const App = props => {
  useEffect(() => {
    messaging().registerDeviceForRemoteMessages();
    LogBox.ignoreAllLogs();
    SplashScreen.hide();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <StackNavigation />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
