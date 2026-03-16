import { by, device, element, expect } from 'detox';

describe('Deep Linking', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });

    // Login first to access authenticated routes
    await waitFor(element(by.id('input-email')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('input-email')).typeText('test@example.com');
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.text('Login')).tap();

    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should open EditApp screen via autonomous://app/:appId deep link', async () => {
    await device.openURL({ url: 'autonomous://app/1' });

    await waitFor(element(by.text(/edit.*app|app.*detail/i)))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display the correct app data for the deep-linked appId', async () => {
    // App with id "1" should be "Analytics Pro" based on mock data
    await expect(element(by.text('Analytics Pro'))).toBeVisible();
  });

  it('should navigate back to dashboard from deep-linked screen', async () => {
    try {
      await element(by.id('back-button')).tap();
    } catch {
      await device.pressBack();
    }

    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle deep link when app is in background', async () => {
    await device.sendToHome();
    await device.openURL({ url: 'autonomous://app/2' });

    await waitFor(element(by.text(/edit.*app|app.*detail/i)))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle deep link with cold start', async () => {
    await device.terminateApp();
    await device.launchApp({
      newInstance: true,
      url: 'autonomous://app/1',
    });

    // App may show splash first, then navigate
    // Either the app deep links after auth or shows login screen
    await waitFor(
      element(by.text(/edit.*app|welcome back/i)),
    )
      .toBeVisible()
      .withTimeout(15000);
  });
});
