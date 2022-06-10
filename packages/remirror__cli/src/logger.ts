/* eslint-disable no-console */

const prefix = '[remirror-cli]';

export const logger = {
  log: (...args: any[]) => {
    return logger.info(...args);
  },
  info: (...args: any[]) => {
    console.log(prefix, 'info', ...args);
  },
  warn: (...args: any[]) => {
    console.warn(prefix, 'warn', ...args);
  },
  error: (...args: any[]) => {
    console.warn(prefix, 'error', ...args);
  },
};
