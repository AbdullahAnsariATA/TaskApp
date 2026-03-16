import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from 'constants/index';
import { useBackHandler } from 'hooks/index';
import { screenOptions } from '.';
import DashboardScreen from 'screens/dashboard/DashboardScreen';
import CreateAppScreen from 'screens/apps/CreateAppScreen';
import EditAppScreen from 'screens/apps/EditAppScreen';
import SubscriptionDetailScreen from 'screens/subscription/SubscriptionDetailScreen';
import PlanUpgradeScreen from 'screens/subscription/PlanUpgradeScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  useBackHandler();

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName={SCREENS.DASHBOARD}>
      <Stack.Screen name={SCREENS.DASHBOARD} component={DashboardScreen} />
      <Stack.Screen name={SCREENS.CREATE_APP} component={CreateAppScreen} />
      <Stack.Screen name={SCREENS.EDIT_APP} component={EditAppScreen} />
      <Stack.Screen name={SCREENS.SUBSCRIPTION_DETAIL} component={SubscriptionDetailScreen} />
      <Stack.Screen name={SCREENS.PLAN_UPGRADE} component={PlanUpgradeScreen} />
    </Stack.Navigator>
  );
};
