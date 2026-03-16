import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppSettingsState {
  isUserLoggedIn: boolean;
  isAppLoading: boolean;
  isUserVisitedApp: boolean;
  appLanguage: string;
  themeMode: 'light' | 'dark' | 'system';
  isBiometricEnabled: boolean;
}

const initialState: AppSettingsState = {
  isUserLoggedIn: false,
  isAppLoading: false,
  isUserVisitedApp: false,
  appLanguage: 'en',
  themeMode: 'system',
  isBiometricEnabled: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsUserLoggedIn(state, action: PayloadAction<boolean>) {
      state.isUserLoggedIn = action.payload;
    },
    setIsUserVisitedApp(state, action: PayloadAction<boolean>) {
      state.isUserVisitedApp = action.payload;
    },
    setIsAppLoading(state, action: PayloadAction<boolean>) {
      state.isAppLoading = action.payload;
    },
    setAppLanguage(state, action: PayloadAction<string>) {
      state.appLanguage = action.payload;
    },
    setThemeMode(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.themeMode = action.payload;
    },
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.isBiometricEnabled = action.payload;
    },
    resetAppState(state) {
      state.isUserLoggedIn = false;
      state.isAppLoading = false;
    },
  },
});

export const {
  setIsUserLoggedIn,
  setIsUserVisitedApp,
  setIsAppLoading,
  setAppLanguage,
  setThemeMode,
  setBiometricEnabled,
  resetAppState,
} = appSlice.actions;
export default appSlice.reducer;
