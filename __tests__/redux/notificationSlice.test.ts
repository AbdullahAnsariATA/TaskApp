import reducer, {
  setNotificationStatus,
  setIsNotificationAllowed,
  setNotificationUnreadCount,
  NotificationState,
} from '../../src/redux/slices/notification';

const initialState: NotificationState = {
  status: '',
  isAllowed: false,
  unreadCount: 0,
};

describe('notification reducer', () => {
  it('returns the initial state for unknown actions', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('handles setNotificationStatus', () => {
    const state = reducer(initialState, setNotificationStatus('granted'));
    expect(state.status).toBe('granted');
  });

  it('handles setIsNotificationAllowed(true)', () => {
    const state = reducer(initialState, setIsNotificationAllowed(true));
    expect(state.isAllowed).toBe(true);
  });

  it('handles setIsNotificationAllowed(false)', () => {
    const allowed = { ...initialState, isAllowed: true };
    const state = reducer(allowed, setIsNotificationAllowed(false));
    expect(state.isAllowed).toBe(false);
  });

  it('handles setNotificationUnreadCount', () => {
    const state = reducer(initialState, setNotificationUnreadCount(5));
    expect(state.unreadCount).toBe(5);
  });

  it('handles setNotificationUnreadCount to zero', () => {
    const withCount = { ...initialState, unreadCount: 10 };
    const state = reducer(withCount, setNotificationUnreadCount(0));
    expect(state.unreadCount).toBe(0);
  });

  it('preserves other fields when updating one', () => {
    const modified: NotificationState = {
      status: 'denied',
      isAllowed: false,
      unreadCount: 3,
    };
    const state = reducer(modified, setIsNotificationAllowed(true));
    expect(state.isAllowed).toBe(true);
    expect(state.status).toBe('denied');
    expect(state.unreadCount).toBe(3);
  });
});
