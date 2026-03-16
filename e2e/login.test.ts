import { by, device, element, expect } from 'detox';

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the login screen after splash', async () => {
    await waitFor(element(by.text('Welcome Back')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should show email and password input fields', async () => {
    await expect(element(by.id('input-email'))).toBeVisible();
    await expect(element(by.id('input-password'))).toBeVisible();
  });

  it('should show the Login button', async () => {
    await expect(element(by.text('Login'))).toBeVisible();
  });

  it('should show forgot password link', async () => {
    await expect(element(by.text('Forgot Password?'))).toBeVisible();
  });

  it('should show sign-up link', async () => {
    await expect(element(by.text('Sign Up'))).toBeVisible();
  });

  it('should show validation errors for empty submission', async () => {
    await element(by.text('Login')).tap();

    await waitFor(element(by.text(/is required/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for invalid email format', async () => {
    await element(by.id('input-email')).typeText('invalid-email');
    await element(by.id('input-password')).typeText('Password1!');
    await element(by.text('Login')).tap();

    await waitFor(element(by.text(/invalid.*email/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for short password', async () => {
    await element(by.id('input-email')).clearText();
    await element(by.id('input-email')).typeText('test@example.com');
    await element(by.id('input-password')).clearText();
    await element(by.id('input-password')).typeText('short');
    await element(by.text('Login')).tap();

    await waitFor(element(by.text(/password/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should attempt login with valid credentials and handle response', async () => {
    await element(by.id('input-email')).clearText();
    await element(by.id('input-email')).typeText('test@example.com');
    await element(by.id('input-password')).clearText();
    await element(by.id('input-password')).typeText('Abcd1234!');
    await element(by.text('Login')).tap();

    // Either navigates to dashboard or shows error toast depending on backend
    await waitFor(
      element(by.text('Dashboard')).or(element(by.text(/failed|error|invalid/i))),
    )
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should navigate to registration screen', async () => {
    await element(by.text('Sign Up')).tap();

    await waitFor(element(by.text(/create.*account|register|sign up/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to forgot password screen', async () => {
    await device.reloadReactNative();
    await waitFor(element(by.text('Forgot Password?')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.text('Forgot Password?')).tap();

    await waitFor(element(by.text(/forgot.*password|reset.*password/i)))
      .toBeVisible()
      .withTimeout(5000);
  });
});
