describe('logger', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  describe('in development (__DEV__ = true)', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('log() calls console.log', () => {
      const { logger } = require('../../src/utils/logger');
      logger.log('test message', 42);
      expect(console.log).toHaveBeenCalledWith('test message', 42);
    });

    it('warn() calls console.warn', () => {
      const { logger } = require('../../src/utils/logger');
      logger.warn('warning');
      expect(console.warn).toHaveBeenCalledWith('warning');
    });

    it('debug() calls console.debug', () => {
      const { logger } = require('../../src/utils/logger');
      logger.debug('debug info');
      expect(console.debug).toHaveBeenCalledWith('debug info');
    });

    it('error() calls console.error', () => {
      const { logger } = require('../../src/utils/logger');
      logger.error('critical error');
      expect(console.error).toHaveBeenCalledWith('critical error');
    });
  });

  describe('in production (__DEV__ = false)', () => {
    beforeEach(() => {
      (global as any).__DEV__ = false;
    });

    it('log() is a no-op', () => {
      const { logger } = require('../../src/utils/logger');
      logger.log('should not log');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('warn() is a no-op', () => {
      const { logger } = require('../../src/utils/logger');
      logger.warn('should not warn');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('debug() is a no-op', () => {
      const { logger } = require('../../src/utils/logger');
      logger.debug('should not debug');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('error() still calls console.error', () => {
      const { logger } = require('../../src/utils/logger');
      logger.error('always logs errors');
      expect(console.error).toHaveBeenCalledWith('always logs errors');
    });
  });

  it('log() supports multiple arguments', () => {
    (global as any).__DEV__ = true;
    const { logger } = require('../../src/utils/logger');
    logger.log('a', 'b', { c: 3 });
    expect(console.log).toHaveBeenCalledWith('a', 'b', { c: 3 });
  });
});
