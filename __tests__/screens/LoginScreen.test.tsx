import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Text, View, TouchableOpacity } from 'react-native';

jest.mock('api/firebaseAuth', () => ({
  firebaseAuth: {
    login: jest.fn(() =>
      Promise.resolve({
        uid: 'u1',
        email: 'test@test.com',
        displayName: 'Test',
        photoURL: null,
      }),
    ),
    getLocalProfileImage: jest.fn(() => Promise.resolve(null)),
    updateFCMToken: jest.fn(),
  },
}));

jest.mock('navigation/index', () => ({
  navigate: jest.fn(),
  screenOptions: { headerShown: false },
  navigationRef: { isReady: () => false },
}));

jest.mock('constants/index', () => ({
  SCREENS: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
  },
  COMMON_TEXT: {
    LOGIN: 'Login',
    SIGN_UP: 'Sign Up',
    DONT_HAVE_AN_ACCOUNT: "Don't have an account?",
    FORGOT_PASSWORD: 'Forgot Password?',
  },
  AUTH_TEXT: {
    LOGIN_HEADING: 'Welcome Back',
    LOGIN_DESCRIPTION: 'Sign in to continue',
  },
  VARIABLES: {},
}));

jest.mock('utils/toast', () => ({
  showErrorToast: jest.fn(),
}));

jest.mock('utils/index', () => ({
  firebaseLoginValidationSchema: {},
  COLORS: {
    PRIMARY: '#007AFF',
    WHITE: '#FFFFFF',
    BACKGROUND: '#F5F5F5',
    BORDER: '#E0E0E0',
    TEXT_SECONDARY: '#666',
  },
}));

jest.mock('types/fontTypes', () => ({
  FontSize: { Small: 12, Medium: 14, Large: 18, ExtraLarge: 24 },
  FontWeight: { Bold: 'bold' },
}));

// Stub all UI components to avoid deep native dependency chains
jest.mock('components/index', () => {
  const { Text: RNText, View: RNView, TouchableOpacity: RNTO, TextInput: RNTextInput } =
    require('react-native');
  return {
    Button: ({ title, onPress, loading }: any) => (
      <RNTO onPress={onPress} disabled={loading} testID="login-button">
        <RNText>{loading ? 'Loading...' : title}</RNText>
      </RNTO>
    ),
    Input: ({ placeholder, value, onChangeText, name }: any) => (
      <RNTextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        testID={`input-${name}`}
      />
    ),
    AuthComponent: ({ children, heading1, bottomButtonText, onBottomTextPress }: any) => (
      <RNView>
        <RNText>{heading1}</RNText>
        {children}
        <RNTO onPress={onBottomTextPress}>
          <RNText>{bottomButtonText}</RNText>
        </RNTO>
      </RNView>
    ),
    Typography: ({ children, onPress, style }: any) => (
      <RNText onPress={onPress} style={style}>
        {children}
      </RNText>
    ),
    Icon: ({ iconName }: any) => <RNText>{iconName}</RNText>,
  };
});

import LoginScreen from '../../src/screens/auth/LoginScreen';

const createStore = () =>
  configureStore({
    reducer: {
      app: (state: any = { isUserLoggedIn: false, isBiometricEnabled: false }) => state,
      notification: (state = {}) => state,
      auth: (state: any = { user: null }) => state,
      apps: (state: any = { apps: [] }) => state,
    },
  });

const renderScreen = () => {
  const store = createStore();
  let tree: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <LoginScreen />
      </Provider>,
    );
  });
  return { tree: tree!, store };
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { tree } = renderScreen();
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders the login button', () => {
    const { tree } = renderScreen();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Login');
  });

  it('renders forgot password text', () => {
    const { tree } = renderScreen();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Forgot Password?');
  });

  it('does not render biometric button when biometric is unavailable', () => {
    const { tree } = renderScreen();
    const json = JSON.stringify(tree.toJSON());
    // The default mock has isBiometricAvailable = false
    expect(json).not.toContain('Login with Biometric');
  });

  it('renders sign-up link text', () => {
    const { tree } = renderScreen();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Sign Up');
  });

  it('snapshot matches', () => {
    const { tree } = renderScreen();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
