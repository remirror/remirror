/* eslint-disable no-console */

const prefix = '[remirror-cli]';

export const logger = {
  debug: (...args: any[]) => {
    console.debug(prefix, 'DEBUG', ...args);
  },
  log: (...args: any[]) => {
    return logger.info(...args);
  },
  info: (...args: any[]) => {
    console.log(prefix, 'INFO', ...args);
  },
  warn: (...args: any[]) => {
    console.warn(prefix, 'WARN', ...args);
  },
  error: (...args: any[]) => {
    console.error(prefix, 'ERROR', ...args);
  },
  assert: (condition: unknown, message = '') => {
    if (!condition) {
      throw new Error(`${prefix} Assertion failed${message ? `: ${message}` : ''}`);
    }
  },
};
