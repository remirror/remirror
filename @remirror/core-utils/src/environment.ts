/// <reference types="node" />

import { bool } from '@remirror/core-helpers';

/**
 * A object with flags identifying the current environment.
 *
 * @public
 */
export const environment = {
  /**
   * Verifies that the environment has both a window and window.document
   */
  get isBrowser(): boolean {
    return bool(
      typeof window !== 'undefined' &&
        typeof window.document !== 'undefined' &&
        window.navigator &&
        window.navigator.userAgent,
    );
  },

  /**
   * Verifies that the environment is JSDOM
   */
  get isJSDOM(): boolean {
    return environment.isBrowser && window.navigator.userAgent.includes('jsdom');
  },

  /**
   * Verifies that the environment has a nodejs process and is therefore a node environment
   */
  get isNode(): boolean {
    return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  },

  /**
   * True when running on macOS
   */
  get isMac(): boolean {
    return environment.isBrowser && /Mac/.test(navigator.platform);
  },

  /**
   * Verify that this is an apple device either on the client or server.
   */
  get isApple(): boolean {
    return environment.isNode
      ? process.platform === 'darwin'
      : environment.isBrowser
      ? /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
      : false;
  },

  /**
   * True when running in DEVELOPMENT environment
   */
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * True when running unit tests
   */
  get isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  },

  /**
   * True when running in PRODUCTION environment
   */
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
};
