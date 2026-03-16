import MainNavigation from 'navigation/MainNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from 'store/store';
import { ThemeProvider } from 'theme/ThemeContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from 'components/common/ToastConfig';

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <MainNavigation />
            <Toast config={toastConfig} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
