import { createSlice } from '@reduxjs/toolkit';
import { getUser } from './auth';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUser(),
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
