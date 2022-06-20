import path from 'node:path';

import { logger } from '../logger';

let root = '';

/**
 * Get the absolute path to the root of the monorepo.
 */
export function getRoot(): string {
  if (!root) {
    root = path.resolve(__dirname, '../../../..');
    logger.debug(`project root is ${root}`);
  }

  return root;
}
