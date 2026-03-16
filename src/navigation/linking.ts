import { LinkingOptions } from '@react-navigation/native';
import { SCREENS } from 'constants/routes';
import { RootStackParamList } from './Navigators';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['autonomous://'],
  config: {
    screens: {
      [SCREENS.EDIT_APP]: 'app/:appId',
    },
  },
};
