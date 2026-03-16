import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  status: string;
  isAllowed: boolean;
  unreadCount: number;
}

const initialState: NotificationState = {
  status: '',
  isAllowed: false,
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    setIsNotificationAllowed(state, action: PayloadAction<boolean>) {
      state.isAllowed = action.payload;
    },
    setNotificationUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
});

export const { setNotificationStatus, setIsNotificationAllowed, setNotificationUnreadCount } =
  notificationSlice.actions;
export default notificationSlice.reducer;
