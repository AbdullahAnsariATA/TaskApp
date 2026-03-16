import reducer, {
  addApp,
  updateApp,
  deleteApp,
  updateSubscription,
  AppItem,
  AppsState,
} from '../../src/redux/slices/appsSlice';

const createApp = (overrides: Partial<AppItem> = {}): AppItem => ({
  id: '1',
  name: 'Test App',
  description: 'A test application',
  category: 'Testing',
  logo: null,
  subscriptionStatus: 'free',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const emptyState: AppsState = { apps: [] };

describe('appsSlice reducer', () => {
  it('returns a default state with mock apps', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.apps).toBeDefined();
    expect(state.apps.length).toBeGreaterThan(0);
  });

  describe('addApp', () => {
    it('adds a new app to the beginning of the list', () => {
      const state = reducer(
        emptyState,
        addApp({
          name: 'New App',
          description: 'Brand new',
          category: 'Productivity',
          logo: null,
          subscriptionStatus: 'free',
        }),
      );
      expect(state.apps).toHaveLength(1);
      expect(state.apps[0].name).toBe('New App');
      expect(state.apps[0].id).toBeDefined();
      expect(state.apps[0].createdAt).toBeDefined();
      expect(state.apps[0].lastUpdated).toBeDefined();
    });

    it('prepends the new app (most recent first)', () => {
      const existing = { apps: [createApp({ id: 'existing' })] };
      const state = reducer(
        existing,
        addApp({
          name: 'Newer App',
          description: 'Even newer',
          category: 'Tools',
          logo: null,
          subscriptionStatus: 'pro',
        }),
      );
      expect(state.apps).toHaveLength(2);
      expect(state.apps[0].name).toBe('Newer App');
      expect(state.apps[1].id).toBe('existing');
    });
  });

  describe('updateApp', () => {
    it('updates an existing app by id', () => {
      const existing = { apps: [createApp({ id: '1', name: 'Old Name' })] };
      const state = reducer(
        existing,
        updateApp({ id: '1', updates: { name: 'New Name' } }),
      );
      expect(state.apps[0].name).toBe('New Name');
    });

    it('updates lastUpdated timestamp on update', () => {
      const existing = {
        apps: [createApp({ id: '1', lastUpdated: '2020-01-01T00:00:00.000Z' })],
      };
      const state = reducer(
        existing,
        updateApp({ id: '1', updates: { description: 'Updated desc' } }),
      );
      expect(state.apps[0].lastUpdated).not.toBe('2020-01-01T00:00:00.000Z');
    });

    it('does nothing when app id does not exist', () => {
      const existing = { apps: [createApp({ id: '1' })] };
      const state = reducer(
        existing,
        updateApp({ id: 'nonexistent', updates: { name: 'X' } }),
      );
      expect(state.apps[0].name).toBe('Test App');
    });

    it('preserves fields not included in updates', () => {
      const existing = {
        apps: [createApp({ id: '1', name: 'Keep', category: 'Stable' })],
      };
      const state = reducer(
        existing,
        updateApp({ id: '1', updates: { description: 'Changed' } }),
      );
      expect(state.apps[0].name).toBe('Keep');
      expect(state.apps[0].category).toBe('Stable');
      expect(state.apps[0].description).toBe('Changed');
    });
  });

  describe('deleteApp', () => {
    it('removes an app by id', () => {
      const existing = {
        apps: [createApp({ id: '1' }), createApp({ id: '2', name: 'Second' })],
      };
      const state = reducer(existing, deleteApp('1'));
      expect(state.apps).toHaveLength(1);
      expect(state.apps[0].id).toBe('2');
    });

    it('does nothing when app id does not exist', () => {
      const existing = { apps: [createApp({ id: '1' })] };
      const state = reducer(existing, deleteApp('nonexistent'));
      expect(state.apps).toHaveLength(1);
    });

    it('handles deleting from empty list', () => {
      const state = reducer(emptyState, deleteApp('1'));
      expect(state.apps).toHaveLength(0);
    });
  });

  describe('updateSubscription', () => {
    it('updates subscription status for an app', () => {
      const existing = {
        apps: [createApp({ id: '1', subscriptionStatus: 'free' })],
      };
      const state = reducer(
        existing,
        updateSubscription({ id: '1', status: 'pro' }),
      );
      expect(state.apps[0].subscriptionStatus).toBe('pro');
    });

    it('updates lastUpdated when changing subscription', () => {
      const existing = {
        apps: [
          createApp({
            id: '1',
            lastUpdated: '2020-01-01T00:00:00.000Z',
          }),
        ],
      };
      const state = reducer(
        existing,
        updateSubscription({ id: '1', status: 'enterprise' }),
      );
      expect(state.apps[0].lastUpdated).not.toBe('2020-01-01T00:00:00.000Z');
    });

    it('does nothing for nonexistent app id', () => {
      const existing = {
        apps: [createApp({ id: '1', subscriptionStatus: 'free' })],
      };
      const state = reducer(
        existing,
        updateSubscription({ id: 'nope', status: 'pro' }),
      );
      expect(state.apps[0].subscriptionStatus).toBe('free');
    });
  });
});
