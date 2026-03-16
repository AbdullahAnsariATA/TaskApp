import Toast from 'react-native-toast-message';
import { showToast, showSuccessToast, showErrorToast, showInfoToast } from '../../src/utils/toast';

jest.useFakeTimers();

describe('showToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('shows an error toast by default when only message is provided', () => {
    showToast({ message: 'Something went wrong' });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        text2: 'Something went wrong',
        position: 'top',
      }),
    );
  });

  it('shows a success toast when isError is false', () => {
    showToast({ message: 'Done!', isError: false });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('type overrides isError', () => {
    showToast({ message: 'Info', isError: true, type: 'info' });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info' }),
    );
  });

  it('uses text1 and text2 when both provided', () => {
    showToast({ text1: 'Title', text2: 'Description' });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ text1: 'Title', text2: 'Description' }),
    );
  });

  it('uses text1 as title and message as text2', () => {
    showToast({ text1: 'Error', message: 'Details here' });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ text1: 'Error', text2: 'Details here' }),
    );
  });

  it('uses only text1 when provided alone', () => {
    showToast({ text1: 'Just a title' });
    const call = (Toast.show as jest.Mock).mock.calls[0][0];
    expect(call.text1).toBe('Just a title');
    expect(call.text2).toBeUndefined();
  });

  it('uses only text2 when provided alone', () => {
    showToast({ text2: 'Just a description' });
    const call = (Toast.show as jest.Mock).mock.calls[0][0];
    expect(call.text2).toBe('Just a description');
  });

  it('does not show toast when no message, text1, or text2', () => {
    showToast({});
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('does not show toast for empty string message', () => {
    showToast({ message: '' });
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('does not show toast for whitespace-only message', () => {
    showToast({ message: '   ' });
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('hides toast after visibility time', () => {
    showToast({ message: 'Auto-hide' });
    expect(Toast.hide).not.toHaveBeenCalled();
    jest.advanceTimersByTime(4000);
    expect(Toast.hide).toHaveBeenCalled();
  });

  it('clears previous hide timer on new toast', () => {
    showToast({ message: 'First' });
    showToast({ message: 'Second' });
    jest.advanceTimersByTime(4000);
    // hide should be called once (for the second toast), not twice
    expect(Toast.hide).toHaveBeenCalledTimes(1);
  });

  it('respects custom position', () => {
    showToast({ message: 'Bottom', position: 'bottom' });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ position: 'bottom' }),
    );
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('showSuccessToast shows a success toast', () => {
    showSuccessToast('Saved!');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text2: 'Saved!' }),
    );
  });

  it('showSuccessToast with title', () => {
    showSuccessToast('Profile updated', 'Success');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text1: 'Success', text2: 'Profile updated' }),
    );
  });

  it('showErrorToast shows an error toast', () => {
    showErrorToast('Network error');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', text2: 'Network error' }),
    );
  });

  it('showErrorToast with title', () => {
    showErrorToast('Invalid credentials', 'Login Failed');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', text1: 'Login Failed' }),
    );
  });

  it('showInfoToast shows an info toast', () => {
    showInfoToast('Update available');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', text2: 'Update available' }),
    );
  });
});
