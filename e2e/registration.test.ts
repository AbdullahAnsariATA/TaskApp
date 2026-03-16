import { by, device, element, expect } from 'detox';

describe('Registration Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to registration screen from login
    await waitFor(element(by.text('Sign Up')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.text('Sign Up')).tap();
  });

  it('should display the registration form', async () => {
    await expect(element(by.id('input-fullName'))).toBeVisible();
    await expect(element(by.id('input-email'))).toBeVisible();
    await expect(element(by.id('input-password'))).toBeVisible();
    await expect(element(by.id('input-confirmPassword'))).toBeVisible();
  });

  it('should show validation errors when submitting empty form', async () => {
    await element(by.text(/sign up|register|create/i)).tap();

    await waitFor(element(by.text(/is required/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for name too short', async () => {
    await element(by.id('input-fullName')).typeText('AB');
    await element(by.id('input-email')).typeText('user@example.com');
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.id('input-confirmPassword')).typeText('Abcd1234!');
    await element(by.text(/sign up|register|create/i)).tap();

    await waitFor(element(by.text(/at least/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for password mismatch', async () => {
    await element(by.id('input-fullName')).typeText('John Doe');
    await element(by.id('input-email')).typeText('john@example.com');
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.id('input-confirmPassword')).typeText('DifferentPass1!');
    await element(by.text(/sign up|register|create/i)).tap();

    await waitFor(element(by.text(/must match|don't match/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for invalid email', async () => {
    await element(by.id('input-fullName')).typeText('John Doe');
    await element(by.id('input-email')).typeText('not-an-email');
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.id('input-confirmPassword')).typeText('Abcd1234!');
    await element(by.text(/sign up|register|create/i)).tap();

    await waitFor(element(by.text(/invalid.*email/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should attempt registration with valid inputs', async () => {
    const timestamp = Date.now();
    await element(by.id('input-fullName')).typeText('Test User');
    await element(by.id('input-email')).typeText(`testuser${timestamp}@example.com`);
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.id('input-confirmPassword')).typeText('Abcd1234!');
    await element(by.text(/sign up|register|create/i)).tap();

    // Either navigates to dashboard or shows error (e.g. email in use)
    await waitFor(
      element(by.text('Dashboard')).or(element(by.text(/error|failed|exists/i))),
    )
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should navigate back to login screen', async () => {
    // Look for a back button or "Login" link
    const backButton = element(by.id('back-button'));
    try {
      await backButton.tap();
    } catch {
      await device.pressBack();
    }

    await waitFor(element(by.text('Welcome Back')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
