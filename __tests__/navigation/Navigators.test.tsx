jest.mock('components/index', () => ({
  Icon: 'Icon',
  Button: 'Button',
  Input: 'Input',
  Typography: 'Typography',
  AuthComponent: ({ children }: any) => children,
}));
jest.mock('constants/common', () => ({
  LANGUAGES: { ARABIC: 'arabic', ENGLISH: 'english' },
  VARIABLES: { Entypo: 'Entypo' },
}));
jest.mock('utils/colors', () => ({
  COLORS: {
    PRIMARY: '#007AFF',
    WHITE: '#FFFFFF',
    BACKGROUND: '#F5F5F5',
    BORDER: '#E0E0E0',
    TEXT_SECONDARY: '#666',
  },
}));

import {
  navigationRef,
  navigate,
  onBack,
  screenOptions,
} from '../../src/navigation/Navigators';

describe('Navigators', () => {
  describe('navigationRef', () => {
    it('is defined', () => {
      expect(navigationRef).toBeDefined();
    });

    it('has isReady method', () => {
      expect(typeof navigationRef.isReady).toBe('function');
    });
  });

  describe('navigate', () => {
    it('does not throw when navigationRef is not ready', () => {
      expect(() => navigate('Login' as any)).not.toThrow();
    });
  });

  describe('onBack', () => {
    it('does not throw when no current ref', () => {
      expect(() => onBack()).not.toThrow();
    });
  });

  describe('screenOptions', () => {
    it('hides the header by default', () => {
      expect(screenOptions.headerShown).toBe(false);
    });

    it('uses fade animation', () => {
      expect(screenOptions.animation).toBe('fade');
    });

    it('hides header shadow', () => {
      expect(screenOptions.headerShadowVisible).toBe(false);
    });

    it('centers header title', () => {
      expect(screenOptions.headerTitleAlign).toBe('center');
    });

    it('sets minimal back button mode', () => {
      expect(screenOptions.headerBackButtonDisplayMode).toBe('minimal');
    });
  });
});
