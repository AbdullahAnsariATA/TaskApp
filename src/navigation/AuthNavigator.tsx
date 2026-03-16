import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from 'constants/index';
import { useBackHandler } from 'hooks/index';
import LoginScreen from 'screens/auth/LoginScreen';
import RegisterScreen from 'screens/auth/RegisterScreen';
import ForgotPasswordScreen from 'screens/auth/ForgotPasswordScreen';
import { screenOptions } from './Navigators';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  useBackHandler();

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName={SCREENS.LOGIN}>
      <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREENS.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={SCREENS.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
