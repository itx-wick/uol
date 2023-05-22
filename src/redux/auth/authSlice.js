import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  currentUser: {},
};

export const authSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    login: (state, payload) => {
      state.isLoggedIn = true;
      state.currentUser = payload.payload;
    },
    setCurrentUser: (state, payload) => {
      state.currentUser = payload.payload;
    },
    logout: (state, payload) => {
      state.isLoggedIn = false;
      state.currentUser = {};
    },
  },
});
export const {login, setCurrentUser, logout} = authSlice.actions;
export default authSlice.reducer;
