import { useEffect, useState, useCallback } from 'react';
import * as Keychain from 'react-native-keychain';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { setBiometricEnabled } from 'store/slices/appSettings';
import { logger } from 'utils/logger';

type BiometryType = Keychain.BIOMETRY_TYPE | null;

const BIOMETRIC_SERVICE = 'com.taskproject.biometric_credentials';

const getBiometricIcon = (type: BiometryType) => {
  if (type === Keychain.BIOMETRY_TYPE.FACE_ID || type === Keychain.BIOMETRY_TYPE.FACE) {
    return 'face-recognition';
  }
  return 'fingerprint';
};

const getBiometricLabel = (type: BiometryType) => {
  switch (type) {
    case Keychain.BIOMETRY_TYPE.FACE_ID:
      return 'Face ID';
    case Keychain.BIOMETRY_TYPE.FACE:
      return 'Face Unlock';
    case Keychain.BIOMETRY_TYPE.TOUCH_ID:
      return 'Touch ID';
    case Keychain.BIOMETRY_TYPE.FINGERPRINT:
      return 'Fingerprint';
    case Keychain.BIOMETRY_TYPE.IRIS:
      return 'Iris';
    default:
      return 'Biometric';
  }
};

export const useBiometricAuth = () => {
  const dispatch = useAppDispatch();
  const isBiometricEnabled = useAppSelector(state => state.app.isBiometricEnabled);
  const [biometryType, setBiometryType] = useState<BiometryType>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const type = await Keychain.getSupportedBiometryType();
        logger.log('Biometry type detected:', type);
        setBiometryType(type);
      } catch (error) {
        logger.log('Biometric check failed:', error);
        setBiometryType(null);
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  const isBiometricAvailable = !isChecking && biometryType !== null && isBiometricEnabled;
  const biometricIconName = getBiometricIcon(biometryType);
  const biometricLabel = getBiometricLabel(biometryType);

  const saveCredentials = useCallback(
    async (email: string, password: string) => {
      try {
        const payload = JSON.stringify({ email, password });
        await Keychain.setGenericPassword(BIOMETRIC_SERVICE, payload, {
          service: BIOMETRIC_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        });
        dispatch(setBiometricEnabled(true));
        logger.log('Biometric credentials saved successfully');
      } catch (error) {
        logger.log('Biometric save with accessControl failed, trying without:', error);
        try {
          const payload = JSON.stringify({ email, password });
          await Keychain.setGenericPassword(BIOMETRIC_SERVICE, payload, {
            service: BIOMETRIC_SERVICE,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          });
          dispatch(setBiometricEnabled(true));
          logger.log('Biometric credentials saved (without accessControl)');
        } catch (fallbackError) {
          logger.log('Failed to save biometric credentials entirely:', fallbackError);
        }
      }
    },
    [dispatch],
  );

  const authenticateWithBiometric = useCallback(async (): Promise<{
    email: string;
    password: string;
  } | null> => {
    try {
      const label = getBiometricLabel(biometryType);
      const credentials = await Keychain.getGenericPassword({
        service: BIOMETRIC_SERVICE,
        authenticationPrompt: {
          title: `Login with ${label}`,
          subtitle: 'Authenticate to sign in',
        },
      });
      if (!credentials || typeof credentials === 'boolean') {
        logger.log('No biometric credentials found');
        return null;
      }
      const parsed = JSON.parse(credentials.password);
      if (parsed?.email && parsed?.password) {
        return { email: parsed.email, password: parsed.password };
      }
      return null;
    } catch (error) {
      logger.log('Biometric authentication failed:', error);
      return null;
    }
  }, [biometryType]);

  const clearBiometricCredentials = useCallback(async () => {
    try {
      await Keychain.resetGenericPassword({ service: BIOMETRIC_SERVICE });
      dispatch(setBiometricEnabled(false));
    } catch (error) {
      logger.log('Failed to clear biometric credentials:', error);
    }
  }, [dispatch]);

  return {
    biometryType,
    isBiometricAvailable,
    biometricIconName,
    biometricLabel,
    saveCredentials,
    authenticateWithBiometric,
    clearBiometricCredentials,
  };
};
