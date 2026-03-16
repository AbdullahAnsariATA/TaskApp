import reducer, {
  setIsUserLoggedIn,
  setIsUserVisitedApp,
  setIsAppLoading,
  setAppLanguage,
  setThemeMode,
  setBiometricEnabled,
  resetAppState,
  AppSettingsState,
} from '../../src/redux/slices/appSettings';

const initialState: AppSettingsState = {
  isUserLoggedIn: false,
  isAppLoading: false,
  isUserVisitedApp: false,
  appLanguage: 'en',
  themeMode: 'system',
  isBiometricEnabled: false,
};

describe('appSettings reducer', () => {
  it('returns the initial state for unknown actions', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('handles setIsUserLoggedIn(true)', () => {
    const state = reducer(initialState, setIsUserLoggedIn(true));
    expect(state.isUserLoggedIn).toBe(true);
  });

  it('handles setIsUserLoggedIn(false)', () => {
    const logged = { ...initialState, isUserLoggedIn: true };
    const state = reducer(logged, setIsUserLoggedIn(false));
    expect(state.isUserLoggedIn).toBe(false);
  });

  it('handles setIsUserVisitedApp', () => {
    const state = reducer(initialState, setIsUserVisitedApp(true));
    expect(state.isUserVisitedApp).toBe(true);
  });

  it('handles setIsAppLoading', () => {
    const state = reducer(initialState, setIsAppLoading(true));
    expect(state.isAppLoading).toBe(true);
  });

  it('handles setAppLanguage', () => {
    const state = reducer(initialState, setAppLanguage('ar'));
    expect(state.appLanguage).toBe('ar');
  });

  it('handles setThemeMode to light', () => {
    const state = reducer(initialState, setThemeMode('light'));
    expect(state.themeMode).toBe('light');
  });

  it('handles setThemeMode to dark', () => {
    const state = reducer(initialState, setThemeMode('dark'));
    expect(state.themeMode).toBe('dark');
  });

  it('handles setBiometricEnabled', () => {
    const state = reducer(initialState, setBiometricEnabled(true));
    expect(state.isBiometricEnabled).toBe(true);
  });

  it('handles resetAppState', () => {
    const modified: AppSettingsState = {
      isUserLoggedIn: true,
      isAppLoading: true,
      isUserVisitedApp: true,
      appLanguage: 'fr',
      themeMode: 'dark',
      isBiometricEnabled: true,
    };
    const state = reducer(modified, resetAppState());
    expect(state.isUserLoggedIn).toBe(false);
    expect(state.isAppLoading).toBe(false);
    // resetAppState only resets login and loading; other fields stay
    expect(state.isUserVisitedApp).toBe(true);
    expect(state.appLanguage).toBe('fr');
    expect(state.themeMode).toBe('dark');
    expect(state.isBiometricEnabled).toBe(true);
  });

  it('preserves unrelated state when setting a single field', () => {
    const modified: AppSettingsState = {
      ...initialState,
      appLanguage: 'es',
      themeMode: 'dark',
    };
    const state = reducer(modified, setIsUserLoggedIn(true));
    expect(state.isUserLoggedIn).toBe(true);
    expect(state.appLanguage).toBe('es');
    expect(state.themeMode).toBe('dark');
  });
});
