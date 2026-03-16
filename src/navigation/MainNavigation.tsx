import { useState } from 'react';
import { AppNavigator, AuthNavigator, navigationRef } from './index';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from 'types/reduxTypes';
import { useTheme } from 'hooks/useTheme';
import { SplashScreen } from 'components/common';
import useFirebaseMessaging from 'hooks/useMessaging';
import { linking } from './linking';

const MainNavigation = () => {
  const isUserLoggedIn = useAppSelector(state => state.app.isUserLoggedIn);
  const { theme, themeVersion } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useFirebaseMessaging();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={theme}
      ref={navigationRef}
      key={`nav-${themeVersion}`}
    >
      {isUserLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default MainNavigation;
