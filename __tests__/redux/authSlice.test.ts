import reducer, {
  setAuthUser,
  clearAuth,
  FirebaseUser,
  AuthState,
} from '../../src/redux/slices/authSlice';

const initialState: AuthState = { user: null };

const mockUser: FirebaseUser = {
  uid: 'user-123',
  email: 'john@example.com',
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg',
};

describe('authSlice reducer', () => {
  it('returns the initial state for unknown actions', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('handles setAuthUser', () => {
    const state = reducer(initialState, setAuthUser(mockUser));
    expect(state.user).toEqual(mockUser);
  });

  it('overwrites existing user with setAuthUser', () => {
    const existing = { user: mockUser };
    const newUser: FirebaseUser = {
      uid: 'user-456',
      email: 'jane@example.com',
      displayName: 'Jane Doe',
      photoURL: null,
    };
    const state = reducer(existing, setAuthUser(newUser));
    expect(state.user).toEqual(newUser);
  });

  it('handles clearAuth resetting to initial state', () => {
    const withUser = { user: mockUser };
    const state = reducer(withUser, clearAuth());
    expect(state).toEqual(initialState);
    expect(state.user).toBeNull();
  });

  it('clearAuth is idempotent on initial state', () => {
    const state = reducer(initialState, clearAuth());
    expect(state).toEqual(initialState);
  });

  it('handles user with null optional fields', () => {
    const minimalUser: FirebaseUser = {
      uid: 'min-1',
      email: null,
      displayName: null,
      photoURL: null,
    };
    const state = reducer(initialState, setAuthUser(minimalUser));
    expect(state.user?.uid).toBe('min-1');
    expect(state.user?.email).toBeNull();
    expect(state.user?.displayName).toBeNull();
    expect(state.user?.photoURL).toBeNull();
  });
});
