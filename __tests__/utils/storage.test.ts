import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {
  setItem,
  getItem,
  removeItem,
  clearAllStorageItems,
  removeMultipleItem,
  setKeychainItem,
  getKeychainItem,
  removeKeychainItem,
} from '../../src/utils/storage';

describe('AsyncStorage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('serializes and stores a value', async () => {
      await setItem('key', { foo: 'bar' });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ foo: 'bar' }),
      );
    });

    it('stores primitive values', async () => {
      await setItem('count', 42);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('count', '42');
    });

    it('handles errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage full'),
      );
      await expect(setItem('key', 'value')).resolves.toBeUndefined();
    });
  });

  describe('getItem', () => {
    it('returns parsed value when key exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ foo: 'bar' }),
      );
      const result = await getItem('key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('returns null when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await getItem('missing');
      expect(result).toBeNull();
    });

    it('returns null on parse error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Read error'),
      );
      const result = await getItem('bad');
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('removes a key from storage', async () => {
      await removeItem('key');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('key');
    });

    it('handles errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      await expect(removeItem('key')).resolves.toBeUndefined();
    });
  });

  describe('clearAllStorageItems', () => {
    it('clears all AsyncStorage', async () => {
      await clearAllStorageItems();
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });
  });

  describe('removeMultipleItem', () => {
    it('removes multiple keys', async () => {
      await removeMultipleItem(['a', 'b', 'c']);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['a', 'b', 'c']);
    });
  });
});

describe('Keychain helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setKeychainItem', () => {
    it('saves a value to Keychain with service name', async () => {
      await setKeychainItem('myKey', 'secret');
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'myKey',
        'secret',
        expect.objectContaining({ service: 'myKey' }),
      );
    });

    it('saves empty string when value is falsy', async () => {
      await setKeychainItem('myKey', '');
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'myKey',
        '',
        expect.objectContaining({ service: 'myKey' }),
      );
    });

    it('throws on Keychain error', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain locked'),
      );
      await expect(setKeychainItem('k', 'v')).rejects.toThrow('Keychain locked');
    });
  });

  describe('getKeychainItem', () => {
    it('returns the password when credentials exist', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        username: 'key',
        password: 'secret-value',
      });
      const result = await getKeychainItem('myKey');
      expect(result).toBe('secret-value');
    });

    it('returns null when no credentials found', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);
      const result = await getKeychainItem('missing');
      expect(result).toBeNull();
    });

    it('returns null on error', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const result = await getKeychainItem('bad');
      expect(result).toBeNull();
    });
  });

  describe('removeKeychainItem', () => {
    it('resets Keychain for the given service', async () => {
      await removeKeychainItem('myKey');
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'myKey',
      });
    });

    it('handles errors gracefully', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      await expect(removeKeychainItem('key')).resolves.toBeUndefined();
    });
  });
});
