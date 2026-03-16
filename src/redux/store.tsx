import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppReducer,
  NotificationReducer,
  AuthReducer,
  AppsReducer,
} from './slices/index';

const rootReducer = combineReducers({
  app: AppReducer,
  notification: NotificationReducer,
  auth: AuthReducer,
  apps: AppsReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  whitelist: ['app', 'auth', 'apps'],
  blacklist: ['notification'],
  debug: __DEV__,
  migrate: (state: any) => {
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
        ],
        ignoredActionPaths: ['meta.arg', 'payload'],
        ignoredPaths: ['_persist'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
