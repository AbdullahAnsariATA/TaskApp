import { by, device, element, expect } from 'detox';

/**
 * Dashboard tests require an authenticated session. In a CI setup,
 * seed a test account or use device.launchApp with userDefaults/sharedPrefs
 * to inject an authenticated state via redux-persist.
 */
describe('Dashboard & App Management', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { detoxTestUser: 'true' },
    });

    // Login first
    await waitFor(element(by.id('input-email')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('input-email')).typeText('test@example.com');
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.text('Login')).tap();

    // Wait for dashboard to appear (or handle auth failure gracefully)
    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should display the dashboard screen', async () => {
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should display app cards', async () => {
    // The initial mock data has apps like "Analytics Pro", "Task Manager"
    await waitFor(element(by.text('Analytics Pro')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show subscription status badges on app cards', async () => {
    await expect(
      element(by.text(/pro|free|enterprise/i)).atIndex(0),
    ).toBeVisible();
  });

  it('should navigate to create app screen', async () => {
    await element(by.id('create-app-button')).tap();

    await waitFor(element(by.text(/create.*app|new.*app/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should validate create app form', async () => {
    // Submit empty form
    await element(by.text(/create|save|submit/i)).tap();

    await waitFor(element(by.text(/is required/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should go back to dashboard from create app', async () => {
    try {
      await element(by.id('back-button')).tap();
    } catch {
      await device.pressBack();
    }

    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to edit app screen by tapping an app card', async () => {
    await element(by.text('Analytics Pro')).tap();

    await waitFor(element(by.text(/edit.*app|app.*detail/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should go back to dashboard from edit app', async () => {
    try {
      await element(by.id('back-button')).tap();
    } catch {
      await device.pressBack();
    }

    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show delete confirmation modal', async () => {
    // Long-press or tap delete icon on an app card
    await element(by.text('Analytics Pro')).longPress();

    // Try to find delete modal or option
    await waitFor(element(by.text(/delete|remove/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should dismiss delete modal on cancel', async () => {
    await element(by.text(/cancel/i)).tap();

    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
  });
});

describe('Dashboard - Logout', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { detoxTestUser: 'true' },
    });

    // Login
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

  it('should show logout confirmation modal', async () => {
    await element(by.id('logout-button')).tap();

    await waitFor(element(by.text(/log\s*out|sign\s*out/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should return to login screen after logout', async () => {
    // Confirm logout
    await element(by.text(/confirm|yes|log\s*out/i)).tap();

    await waitFor(element(by.text('Welcome Back')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
