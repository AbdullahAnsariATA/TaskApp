import { COMMON_TEXT } from 'constants/screens';
import { Alert, Dimensions, NativeModules, Platform, PixelRatio } from 'react-native';
import { voidFuntionType } from 'types/common';
import { COLORS } from 'utils/colors';
import { getUniqueId, getVersion, getBrand } from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import { showToast } from 'utils/toast';
import { logger } from 'utils/logger';
import { SelectedMedia } from 'hooks/useMediaPicker';

export const initNetworkListener = () => {
  NetInfo.addEventListener(state => {
    if (!state.isConnected) {
      showToast({ message: '📴 No Internet Connection' });
    } else {
      showToast({ message: '✅ Back Online', isError: false });
    }
  });
};

export const openCameraOrGallery = ({
  cameraPress,
  galleryPress,
}: {
  cameraPress: voidFuntionType;
  galleryPress: voidFuntionType;
}) => {
  Alert.alert(
    'Choose Option',
    'Select an option to upload a photo',
    [
      {
        text: 'Camera',
        onPress: cameraPress,
      },
      {
        text: 'Gallery',
        onPress: galleryPress,
      },
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true },
  );
};

export const safeString = (val?: string | number | null | undefined): string =>
  val != null ? String(val) : '';

export const safeNumber = (val?: number | null): number => val ?? 0;

export const screenHeight = (percent: number) => {
  const screenHeight = Dimensions.get('window').height;
  return (screenHeight * percent) / 100;
};

export const screenWidth = (percent: number) => {
  const screenWidth = Dimensions.get('window').width;
  return (screenWidth * percent) / 100;
};

export const fontScale = (percent: number) => {
  const scale = Dimensions.get('window').scale;
  return (scale * percent) / 2;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCALE = SCREEN_WIDTH > SCREEN_HEIGHT ? SCREEN_HEIGHT : SCREEN_WIDTH;
const BASE_WIDTH = 375;

const fontConfig = {
  phone: {
    small: { min: 0.85, max: 0.95 },
    medium: { min: 0.9, max: 1.0 },
    large: { min: 0.95, max: 1.05 },
  },
  tablet: {
    small: { min: 1.2, max: 1.3 },
    medium: { min: 1.3, max: 1.4 },
    large: { min: 1.4, max: 1.5 },
  },
};

export const getDeviceType = (): 'phone' | 'tablet' => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return 'tablet';
  } else if (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)) {
    return 'tablet';
  } else {
    return 'phone';
  }
};

const getScreenSizeCategory = (): 'small' | 'medium' | 'large' => {
  if (SCALE < 350) return 'small';
  if (SCALE > 500) return 'large';
  return 'medium';
};

export const getResponsiveFontSize = (size: number): number => {
  const deviceType = getDeviceType();
  const screenCategory = getScreenSizeCategory();
  const config = fontConfig[deviceType][screenCategory];

  const scaleFactor = SCALE / BASE_WIDTH;
  const clampedScaleFactor = Math.min(Math.max(scaleFactor, config.min), config.max);
  let newSize = size * clampedScaleFactor;

  if (Platform.OS === 'android') {
    newSize *= 0.85;
  } else {
    newSize *= 1.15;
  }

  if (deviceType === 'tablet') {
    newSize *= 1.08;
  }

  const finalSize = PixelRatio.roundToNearestPixel(newSize);
  const minSize = Platform.OS === 'ios' ? 10 : 9;

  return Math.max(minSize, finalSize);
};

export const adjustFontConfig = (
  deviceType: 'phone' | 'tablet',
  sizeCategory: 'small' | 'medium' | 'large',
  minScale: number,
  maxScale: number,
) => {
  fontConfig[deviceType][sizeCategory] = { min: minScale, max: maxScale };
};

export const formatTitle = (text: string, firstLineWords: number = 2): string => {
  const words = text.split(' ');
  if (words.length <= 2) {
    return text;
  }
  const firstLine = words.slice(0, firstLineWords).join(' ');
  const secondLine = words.slice(firstLineWords).join(' ');
  return `${firstLine}\n${secondLine}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const datePart = formatDateMonthDayYear(date);
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} ${timePart}`;
};

export const formatDateMonthDayYear = (
  dateInput: string | Date | number | null | undefined,
): string => {
  if (!dateInput) return '';

  try {
    const date =
      typeof dateInput === 'string' || typeof dateInput === 'number'
        ? new Date(dateInput)
        : dateInput;

    if (isNaN(date.getTime())) return '';

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    logger.error('Error formatting date:', error);
    return '';
  }
};

export const isIOS = () => {
  return Platform.OS === 'ios';
};

export const roundToNearestHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};

export const deviceType = () => {
  return Platform.OS;
};

export const deviceUdid = async () => {
  return await getUniqueId();
};

export const appVersion = () => {
  return getVersion();
};

export const deviceOS = () => {
  return Platform.OS;
};

export const deviceBrand = () => {
  return getBrand();
};

export const deviceDetails = async () => {
  const { getFCMToken } = await import('utils/notifications');
  const token = await getFCMToken();
  return {
    udid: await getUniqueId(),
    device_type: deviceType(),
    device_brand: deviceBrand(),
    device_os: deviceOS(),
    app_version: appVersion(),
    device_token: token || '',
  };
};

export const getDeviceLang = () => {
  const appLanguage = isIOS()
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
    : NativeModules.I18nManager.localeIdentifier;

  return appLanguage.search(/-|_/g) !== -1 ? appLanguage.slice(0, 2) : appLanguage;
};

export const capitalizeFirstCharacter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const hasUri = (v: unknown): v is SelectedMedia =>
  !!v && typeof v === 'object' && !!(v as SelectedMedia)?.uri;

export const greetings = (): string => {
  const hours = new Date().getHours();
  if (hours < 6) {
    return COMMON_TEXT.GREETINGS;
  } else if (hours < 12) {
    return COMMON_TEXT.GOOD_MORNING;
  } else if (hours < 18) {
    return COMMON_TEXT.GOOD_AFTERNOON;
  } else {
    return COMMON_TEXT.GOOD_EVENING;
  }
};
