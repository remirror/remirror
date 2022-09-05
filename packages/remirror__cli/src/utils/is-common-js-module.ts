import { logger } from '../logger';
import { runCommand } from './run-command';

const testedModules = new Map<string, boolean>();

/**
 * Check if the provided module supports commonjs require.
 */
export async function isCommonJSModule(cwd: string, module: string): Promise<boolean> {
  if (testedModules.has(module)) {
    return testedModules.get(module) ?? false;
  }

  logger.debug(`checking require for module ${module}`);
  try {
    await runCommand('node', ['-e', `require('${module}')`], { cwd });
    testedModules.set(module, true);
    return true;
  } catch (error) {
    logger.warn(`Failed to use Node.JS 'require()' to load module: ${module}`);
    logger.warn(error);
    testedModules.set(module, false);
    return false;
  }
}
