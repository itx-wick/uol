import {createSlice} from '@reduxjs/toolkit';
const initialState = {
  fromDate: '',
  toDate: '',
  userType: '',
  loader: false,
  usersList: [],
};

export const commonSlice = createSlice({
  name: 'Common',
  initialState,
  reducers: {
    setLoader: (state, payload) => {
      state.loader = payload.payload;
    },
    setStartDate: (state, payload) => {
      state.fromDate = payload.payload;
    },
    setEndDate: (state, payload) => {
      state.toDate = payload.payload;
    },
    setUsersList: (state, payload) => {
      state.usersList = [...state.usersList, payload.payload];
    },
    updateUsersList: (state, payload) => {
      state.usersList = state.usersList.map(person => {
        if (person.ID === payload.payload.ID) {
          return payload.payload;
        }
        return person;
      });
    },
    clearUsersList: (state, payload) => {
      state.usersList = payload.payload;
    },
    setUserType: (state, payload) => {
      state.userType = payload.payload;
    },
  },
});
export const {
  setLoader,
  setStartDate,
  setEndDate,
  setUsersList,
  updateUsersList,
  clearUsersList,
  setUserType,
} = commonSlice.actions;
export default commonSlice.reducer;

// const commonReducer = (state = INITIAL_STATE, action) => {
//   switch (action.type) {
//     case ActionsType.SET_FROM_DATE:
//       return {
//         ...state,
//         fromDate: action.payload,
//       };
//     case ActionsType.SET_TO_DATE:
//       return {
//         ...state,
//         toDate: action.payload,
//       };
//     case ActionsType.SET_LOADER:
//       return {
//         ...state,
//         loader: action.payload,
//       };
//     case ActionsType.USERS_LIST:
//       return {
//         ...state,
//         usersList: [...state.usersList, action.payload],
//       };
//     case ActionsType.UPDATE_USERS_LIST:
//       return {
//         ...state,
//         usersList: state.usersList.map(person => {
//           if (person.ID === action.payload.ID) {
//             return action.payload;
//           }
//           return person;
//         }),
//       };
//     case ActionsType.CLEAR_USERS_LIST:
//       return {
//         ...state,
//         usersList: action.payload,
//       };
//     case ActionsType.USER_TYPE:
//       return {
//         ...state,
//         userType: action.payload,
//       };
//     default:
//       return state;
//   }
// };

// export default commonReducer;
