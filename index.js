/**
 * @format
 */
import 'react-native-get-random-values';
import './src/i18n';
import {AppRegistry} from 'react-native';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  if (remoteMessage?.notification) {
    await notifee.displayNotification({
      title: remoteMessage.notification.title ?? '',
      body: remoteMessage.notification.body ?? '',
      data: remoteMessage.data,
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
      },
    });
  }
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  // Handle background notification press (e.g. navigation is handled on app open)
});

AppRegistry.registerComponent(appName, () => App);
