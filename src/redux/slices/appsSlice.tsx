import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SubscriptionStatus = 'free' | 'pro' | 'enterprise';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string | null;
  subscriptionStatus: SubscriptionStatus;
  lastUpdated: string;
  createdAt: string;
}

export interface AppsState {
  apps: AppItem[];
}

const now = Date.now();

const MOCK_APPS: AppItem[] = [
  {
    id: '1',
    name: 'Analytics Pro',
    description: 'Advanced analytics and reporting dashboard for your business',
    category: 'Analytics',
    logo: null,
    subscriptionStatus: 'pro',
    lastUpdated: new Date(now - 86400000).toISOString(),
    createdAt: new Date(now - 7 * 86400000).toISOString(),
  },
  {
    id: '2',
    name: 'Task Manager',
    description: 'Organize and track your team tasks efficiently',
    category: 'Productivity',
    logo: null,
    subscriptionStatus: 'free',
    lastUpdated: new Date(now - 2 * 86400000).toISOString(),
    createdAt: new Date(now - 14 * 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'Cloud Storage',
    description: 'Secure cloud storage with automatic sync across devices',
    category: 'Storage',
    logo: null,
    subscriptionStatus: 'enterprise',
    lastUpdated: new Date(now - 3600000).toISOString(),
    createdAt: new Date(now - 30 * 86400000).toISOString(),
  },
  {
    id: '4',
    name: 'CRM Suite',
    description: 'Complete customer relationship management solution',
    category: 'Business',
    logo: null,
    subscriptionStatus: 'pro',
    lastUpdated: new Date(now - 5 * 86400000).toISOString(),
    createdAt: new Date(now - 60 * 86400000).toISOString(),
  },
  {
    id: '5',
    name: 'Email Campaigns',
    description: 'Email marketing automation and campaign management platform',
    category: 'Marketing',
    logo: null,
    subscriptionStatus: 'free',
    lastUpdated: new Date(now - 10 * 86400000).toISOString(),
    createdAt: new Date(now - 90 * 86400000).toISOString(),
  },
];

const initialState: AppsState = {
  apps: MOCK_APPS,
};

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    addApp(state, action: PayloadAction<Omit<AppItem, 'id' | 'createdAt' | 'lastUpdated'>>) {
      const newApp: AppItem = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      state.apps.unshift(newApp);
    },
    updateApp(
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<AppItem, 'id' | 'createdAt'>> }>,
    ) {
      const index = state.apps.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.apps[index] = {
          ...state.apps[index],
          ...action.payload.updates,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    deleteApp(state, action: PayloadAction<string>) {
      state.apps = state.apps.filter(a => a.id !== action.payload);
    },
    updateSubscription(
      state,
      action: PayloadAction<{ id: string; status: SubscriptionStatus }>,
    ) {
      const index = state.apps.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.apps[index].subscriptionStatus = action.payload.status;
        state.apps[index].lastUpdated = new Date().toISOString();
      }
    },
  },
});

export const { addApp, updateApp, deleteApp, updateSubscription } = appsSlice.actions;
export default appsSlice.reducer;
