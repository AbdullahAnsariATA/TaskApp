import { useEffect, useState, useCallback, useRef } from 'react';
import * as Keychain from 'react-native-keychain';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { setBiometricEnabled } from 'store/slices/appSettings';
import { saveUserDetailsForRole, getUserDetailsByRole, clearSavedCredentials } from 'utils/storage';
import { logger } from 'utils/logger';

type BiometryType = Keychain.BIOMETRY_TYPE | null;

const BIOMETRIC_ROLE = 'biometric_default';

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
  const hasAutoTriggered = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const type = await Keychain.getSupportedBiometryType();
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
        await saveUserDetailsForRole(BIOMETRIC_ROLE, { email, password });
        dispatch(setBiometricEnabled(true));
      } catch (error) {
        logger.log('Failed to save biometric credentials:', error);
      }
    },
    [dispatch],
  );

  const authenticateWithBiometric = useCallback(async (): Promise<{
    email: string;
    password: string;
  } | null> => {
    try {
      const saved = await getUserDetailsByRole(BIOMETRIC_ROLE, {
        title: `Login with ${getBiometricLabel(biometryType)}`,
        subtitle: 'Authenticate to sign in',
      });
      if (saved?.email && saved?.password) {
        return { email: saved.email, password: saved.password };
      }
      return null;
    } catch (error) {
      logger.log('Biometric authentication failed:', error);
      return null;
    }
  }, [biometryType]);

  const clearBiometricCredentials = useCallback(async () => {
    try {
      await clearSavedCredentials();
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
    isChecking,
    hasAutoTriggered,
    saveCredentials,
    authenticateWithBiometric,
    clearBiometricCredentials,
  };
};
