import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { COLORS, isIOS } from './index';
import { logger } from 'utils/logger';
import store from 'store/store';
import { PermissionsAndroid } from 'react-native';
import { setIsNotificationAllowed, setNotificationUnreadCount } from 'store/slices/notification';
import { VARIABLES } from 'constants/common';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';

interface DisplayNotificationParams {
  notificationData: any;
  iosSetting?: any;
  androidSetting?: any;
  customButtons?: any;
}

async function displayNotification({
  notificationData,
  iosSetting,
  androidSetting,
  customButtons,
}: DisplayNotificationParams) {
  const notification = JSON.parse(notificationData?.data?.custom);

  logger.log(notification);

  try {
    await notifee.requestPermission({
      sound: true,
      announcement: true,
      alert: true,
    });
    const channelId = await notifee.createChannel({
      id: notification?.type,
      name: notification?.type,
      importance: AndroidImportance.HIGH,
      badge: true,
      sound: 'default',
      vibration: true,
    });
    await notifee.displayNotification({
      title: notification?.title || '',
      body: notification?.body || '',
      data: notification,
      ios: {
        sound: 'default',
        ...iosSetting,
      },
      android: {
        channelId,
        showTimestamp: true,
        color: COLORS.YELLOW,
        importance: AndroidImportance.HIGH,
        actions: customButtons,
        ...androidSetting,
      },
    });
  } catch (error) {
    logger.log('Notifee error:', error);
  }
}

/** Navigate to Dashboard on notification tap. Extend when adding destination screens. */
export const handleNotificationNavigation = (notificationData: any) => {
  logger.log('notificationData?.type', notificationData?.type);
  navigate(SCREENS.DASHBOARD);
};

const handleNotificationOpenedApp = (detail: any, isWait = 0) => {
  setTimeout(() => handleNotificationNavigation(detail), isWait);
};

const isMessageNotification = (data: any): boolean => {
  try {
    const custom = typeof data?.custom === 'string' ? JSON.parse(data.custom) : data?.custom;
    const type = custom?.type ?? '';
    return /new-message|chat/i.test(type);
  } catch {
    return false;
  }
};

let isOnMessagesScreen = false;
export const setIsOnMessagesScreen = (value: boolean) => {
  isOnMessagesScreen = value;
};

const messageHandler = async (remoteMessage: any) => {
  if (isOnMessagesScreen && isMessageNotification(remoteMessage?.data)) return;
  store.dispatch(setNotificationUnreadCount(1));
  displayNotification({
    notificationData: remoteMessage,
  });
};

const onForegroundEvent = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationOpenedApp(detail?.notification?.data);
    }
  });
};

async function requestNotificationPermission() {
  try {
    if (isIOS()) {
      const authStatus = await requestPermission(getMessaging());
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        store.dispatch(setIsNotificationAllowed(true));
      }
    } else {
      const response = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (response === VARIABLES.GRANTED) {
        store.dispatch(setIsNotificationAllowed(true));
      }
    }
  } catch (error) {
    logger.warn('Failed to request notification permission:', error);
  }
}

export const getFCMToken = async () => {
  try {
    const token = await getToken(getMessaging());
    return token;
  } catch (e) {
    logger.log(e);
    return '';
  }
};

export {
  displayNotification,
  handleNotificationOpenedApp,
  messageHandler,
  requestNotificationPermission,
  onForegroundEvent,
};
