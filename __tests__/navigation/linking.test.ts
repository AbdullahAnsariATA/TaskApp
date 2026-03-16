import { linking } from '../../src/navigation/linking';

describe('navigation linking config', () => {
  it('defines the autonomous:// prefix', () => {
    expect(linking.prefixes).toContain('autonomous://');
  });

  it('has a config with screens', () => {
    expect(linking.config).toBeDefined();
    expect(linking.config?.screens).toBeDefined();
  });

  it('maps EditApp screen to app/:appId deep link', () => {
    const screens = linking.config?.screens as Record<string, string>;
    expect(screens.EditApp).toBe('app/:appId');
  });

  it('only has expected screen mappings', () => {
    const screens = linking.config?.screens;
    expect(Object.keys(screens!)).toEqual(['EditApp']);
  });
});
