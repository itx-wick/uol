import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  aboutUs: {},
  events: [],
};
export const drawerSlice = createSlice({
  name: 'Drawer',
  initialState,
  reducers: {
    setAboutUs: (state, payload) => {
      state.aboutUs = payload.payload;
    },
    setEvents: (state, payload) => {
      state.events = payload.payload;
    },
  },
});
export const {setAboutUs, setEvents} = drawerSlice.actions;
export default drawerSlice.reducer;

// const drawerReducer = (state = initialState, action) => {
//   var newState = {};
//   switch (action.type) {
//     case ActionsType.SET_ABOUT_US:
//       newState = {
//         ...state,
//         aboutUs: action.payload,
//       };
//       return newState;
//     case ActionsType.SET_EVENTS:
//       newState = {
//         ...state,
//         events: action.payload,
//       };
//       return newState;
//     default:
//       return state;
//   }
// };

// export default drawerReducer;
