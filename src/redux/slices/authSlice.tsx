import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: FirebaseUser | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<FirebaseUser>) {
      state.user = action.payload;
    },
    clearAuth(): AuthState {
      return initialState;
    },
  },
});

export const { setAuthUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
