import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';

// Must unmock hooks/index so we test the real hook
jest.unmock('hooks/useBiometricAuth');
jest.unmock('hooks/index');

// Mock store/slices/appSettings to provide a real reducer
jest.mock('store/slices/appSettings', () => {
  const { createSlice } = require('@reduxjs/toolkit');
  const slice = createSlice({
    name: 'app',
    initialState: {
      isUserLoggedIn: false,
      isAppLoading: false,
      isUserVisitedApp: false,
      appLanguage: 'en',
      themeMode: 'system',
      isBiometricEnabled: false,
    },
    reducers: {
      setBiometricEnabled(state: any, action: any) {
        state.isBiometricEnabled = action.payload;
      },
    },
  });
  return {
    __esModule: true,
    default: slice.reducer,
    ...slice.actions,
  };
});

// Import after mocks are set up
import { useBiometricAuth } from '../../src/hooks/useBiometricAuth';
import appReducer from '../../src/redux/slices/appSettings';

type HookResult = ReturnType<typeof useBiometricAuth>;

function createTestStore(biometricEnabled = false) {
  return configureStore({
    reducer: {
      app: appReducer,
      notification: (state = {}) => state,
      auth: (state = {}) => state,
      apps: (state = {}) => state,
    },
    preloadedState: {
      app: {
        isUserLoggedIn: false,
        isAppLoading: false,
        isUserVisitedApp: false,
        appLanguage: 'en',
        themeMode: 'system' as const,
        isBiometricEnabled: biometricEnabled,
      },
    },
  });
}

function renderHook(store: ReturnType<typeof createTestStore>) {
  let result: { current: HookResult } = {} as any;

  function TestComponent() {
    result.current = useBiometricAuth();
    return null;
  }

  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );
  });

  return {
    result,
    unmount: () => act(() => renderer.unmount()),
  };
}

describe('useBiometricAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with isChecking true, then resolves', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(null);
    const store = createTestStore(false);
    let result: { current: HookResult } = {} as any;

    await act(async () => {
      function TestComponent() {
        result.current = useBiometricAuth();
        return null;
      }
      ReactTestRenderer.create(
        <Provider store={store}>
          <TestComponent />
        </Provider>,
      );
    });

    expect(result.current.biometryType).toBeNull();
    expect(result.current.isBiometricAvailable).toBe(false);
  });

  it('detects Face ID biometry type', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
      Keychain.BIOMETRY_TYPE.FACE_ID,
    );
    const store = createTestStore(true);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometryType).toBe('FaceID');
    expect(result.current.biometricIconName).toBe('face-recognition');
    expect(result.current.biometricLabel).toBe('Face ID');
    expect(result.current.isBiometricAvailable).toBe(true);
  });

  it('detects Fingerprint biometry type', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
      Keychain.BIOMETRY_TYPE.FINGERPRINT,
    );
    const store = createTestStore(true);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometryType).toBe('Fingerprint');
    expect(result.current.biometricIconName).toBe('fingerprint');
    expect(result.current.biometricLabel).toBe('Fingerprint');
  });

  it('detects Touch ID biometry type', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
      Keychain.BIOMETRY_TYPE.TOUCH_ID,
    );
    const store = createTestStore(true);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometricLabel).toBe('Touch ID');
    expect(result.current.biometricIconName).toBe('fingerprint');
  });

  it('detects Face (Android) biometry type', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
      Keychain.BIOMETRY_TYPE.FACE,
    );
    const store = createTestStore(true);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometricLabel).toBe('Face Unlock');
    expect(result.current.biometricIconName).toBe('face-recognition');
  });

  it('returns fallback label for unknown biometry type', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(null);
    const store = createTestStore(false);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometricLabel).toBe('Biometric');
  });

  it('isBiometricAvailable is false when biometric not enabled in settings', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
      Keychain.BIOMETRY_TYPE.FACE_ID,
    );
    const store = createTestStore(false);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometryType).toBe('FaceID');
    expect(result.current.isBiometricAvailable).toBe(false);
  });

  it('handles getSupportedBiometryType failure gracefully', async () => {
    (Keychain.getSupportedBiometryType as jest.Mock).mockRejectedValueOnce(
      new Error('Hardware unavailable'),
    );
    const store = createTestStore(true);
    const { result } = renderHook(store);

    await act(async () => {});

    expect(result.current.biometryType).toBeNull();
    expect(result.current.isBiometricAvailable).toBe(false);
  });

  describe('saveCredentials', () => {
    it('saves credentials to Keychain and enables biometric', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
        Keychain.BIOMETRY_TYPE.FACE_ID,
      );
      const store = createTestStore(false);
      const { result } = renderHook(store);

      await act(async () => {});
      await act(async () => {
        await result.current.saveCredentials('user@test.com', 'pass123');
      });

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'com.taskproject.biometric_credentials',
        JSON.stringify({ email: 'user@test.com', password: 'pass123' }),
        expect.objectContaining({
          service: 'com.taskproject.biometric_credentials',
        }),
      );
      expect(store.getState().app.isBiometricEnabled).toBe(true);
    });

    it('falls back to saving without accessControl on error', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(null);
      (Keychain.setGenericPassword as jest.Mock)
        .mockRejectedValueOnce(new Error('accessControl not supported'))
        .mockResolvedValueOnce(true);

      const store = createTestStore(false);
      const { result } = renderHook(store);

      await act(async () => {});
      await act(async () => {
        await result.current.saveCredentials('user@test.com', 'pass');
      });

      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(2);
      expect(store.getState().app.isBiometricEnabled).toBe(true);
    });
  });

  describe('authenticateWithBiometric', () => {
    it('returns credentials on successful authentication', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
        Keychain.BIOMETRY_TYPE.FACE_ID,
      );
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        username: 'com.taskproject.biometric_credentials',
        password: JSON.stringify({ email: 'user@test.com', password: 'pass' }),
      });
      const store = createTestStore(true);
      const { result } = renderHook(store);

      await act(async () => {});

      let creds: any;
      await act(async () => {
        creds = await result.current.authenticateWithBiometric();
      });

      expect(creds).toEqual({ email: 'user@test.com', password: 'pass' });
    });

    it('returns null when no credentials stored', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
        Keychain.BIOMETRY_TYPE.FACE_ID,
      );
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);
      const store = createTestStore(true);
      const { result } = renderHook(store);

      await act(async () => {});

      let creds: any;
      await act(async () => {
        creds = await result.current.authenticateWithBiometric();
      });

      expect(creds).toBeNull();
    });

    it('returns null on authentication failure', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
        Keychain.BIOMETRY_TYPE.FACE_ID,
      );
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('User cancelled'),
      );
      const store = createTestStore(true);
      const { result } = renderHook(store);

      await act(async () => {});

      let creds: any;
      await act(async () => {
        creds = await result.current.authenticateWithBiometric();
      });

      expect(creds).toBeNull();
    });
  });

  describe('clearBiometricCredentials', () => {
    it('resets Keychain and disables biometric in store', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(
        Keychain.BIOMETRY_TYPE.FACE_ID,
      );
      const store = createTestStore(true);
      const { result } = renderHook(store);

      await act(async () => {});
      await act(async () => {
        await result.current.clearBiometricCredentials();
      });

      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'com.taskproject.biometric_credentials',
      });
      expect(store.getState().app.isBiometricEnabled).toBe(false);
    });
  });
});
