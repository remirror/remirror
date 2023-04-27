/* eslint-disable no-console */

import { colors } from './utils/colors';

const prefix = colors.magenta('remirror-cli');

export const logger = {
  debug: (...args: any[]) => {
    if (!process.env.DEBUG) {
      return;
    }

    console.debug(prefix, colors.blue('DEBUG'), ...args);
  },
  log: (...args: any[]) => logger.info(...args),
  info: (...args: any[]) => {
    console.log(prefix, colors.green('INFO'), ...args);
  },
  warn: (...args: any[]) => {
    console.warn(prefix, colors.yellow('WARN'), ...args);
  },
  error: (...args: any[]) => {
    console.error(prefix, colors.red('ERROR'), ...args);
  },
  assert: (condition: unknown, message = '') => {
    if (!condition) {
      throw new Error(`${prefix} Assertion failed${message ? `: ${message}` : ''}`);
    }
  },
};
