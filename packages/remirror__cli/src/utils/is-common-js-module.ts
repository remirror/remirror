import { logger } from '../logger';
import { runCommand } from './run-command';

/**
 * Check if the provided module supports commonjs require.
 */
export async function isCommonJSModule(cwd: string, module: string): Promise<boolean> {
  logger.debug(`checking require for module ${module}`);
  try {
    await runCommand('node', ['-e', `require('${module}')`], { cwd });
    return true;
  } catch (error) {
    logger.warn(`Failed to use Node.JS 'require()' to load module: ${module}`);
    logger.warn(error);
    return false;
  }
}
