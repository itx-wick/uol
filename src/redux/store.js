import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';
import {getDefaultMiddleware} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore, persistReducer} from 'redux-persist';
import User from './auth/authSlice';
import Common from './common/commonSlice';
import Drawer from './drawer/drawerSlice';
import Tab from './tabs/tabSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // whitelist: [],
  // blacklist: [],
  // debug :true,
};

const reducerToPersist = combineReducers({
  User,
  Drawer,
  Common,
  Tab,
});
const persistedReducer = persistReducer(persistConfig, reducerToPersist);
const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
});
const store = configureStore({
  reducer: persistedReducer,
  middleware: customizedMiddleware,
});
const persistor = persistStore(store);
export {store, persistor};

// const rootReducer = combineReducers({
//   drawer: drawerReducer,
//   common: commonReducer,
//   user: authReducer,
//   tabs: tabsReducer,
// });

// export const store = createStore(
//   persistReducer(persistConfig, rootReducer),
//   applyMiddleware(thunk),
// );
// export const persistor = persistStore(store);
