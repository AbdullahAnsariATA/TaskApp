import { useDispatch, useSelector } from 'react-redux';
import { AppSettingsState } from 'store/slices/appSettings';
import { NotificationState } from 'store/slices/notification';
import { AuthState } from 'store/slices/authSlice';
import { AppsState } from 'store/slices/appsSlice';
import store from 'store/store';

export type RootState = {
  app: AppSettingsState;
  notification: NotificationState;
  auth: AuthState;
  apps: AppsState;
};

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
