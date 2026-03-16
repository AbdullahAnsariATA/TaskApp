import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Icon } from 'components/index';
import { LANGUAGES, VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import i18n from 'i18n/index';
import { StyleProp, View, ViewStyle } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS } from 'utils/colors';

export type RootStackParamList = {
  [SCREENS.LOGIN]: undefined;
  [SCREENS.REGISTER]: undefined;
  [SCREENS.FORGOT_PASSWORD]: undefined;
  [SCREENS.DASHBOARD]: undefined;
  [SCREENS.CREATE_APP]: undefined;
  [SCREENS.EDIT_APP]: { appId: string };
  [SCREENS.SUBSCRIPTION_DETAIL]: { appId: string };
  [SCREENS.PLAN_UPGRADE]: { appId: string };
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}

export function onBack() {
  navigationRef.current?.goBack();
}

export function replace<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  navigationRef.current?.dispatch(StackActions.replace(name, params));
}

export function popToTop() {
  navigationRef.current?.dispatch(StackActions.popToTop());
}

export function reset<T extends keyof RootStackParamList>(name: T) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name }],
    }),
  );
}

export const screenOptions: NativeStackNavigationOptions = {
  animation: 'fade',
  headerStyle: {
    backgroundColor: COLORS.BACKGROUND,
  },
  headerShown: false,
  headerTintColor: COLORS.PRIMARY,
  headerShadowVisible: false,
  headerLeft: () => <CustomBackIcon />,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontWeight: FontWeight.Bold,
  },
  headerBackButtonDisplayMode: 'minimal',
};

export const CustomBackIcon = ({
  onPress,
  style,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) => (
  <View
    style={[
      {
        backgroundColor: COLORS.PRIMARY,
        padding: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      },
      style,
    ]}
  >
    <Icon
      iconStyle={[
        {
          transform: [{ scaleX: i18n.language === LANGUAGES.ARABIC ? -1 : 1 }],
        },
      ]}
      componentName={VARIABLES.Entypo}
      iconName={'chevron-small-left'}
      size={FontSize.ExtraLarge}
      color={COLORS.WHITE}
      onPress={onPress || onBack}
    />
  </View>
);
