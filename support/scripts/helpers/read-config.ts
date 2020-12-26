import { lstat, readFile } from 'fs/promises';

import DEFAULT_CONFIG from '../../.config.sample.json';
import { baseDir, log } from '.';

/**
 * Check if a file exists for the provide `filePath` the provided target.
 *
 * @param {string} filePath
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await lstat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export interface HooksConfig {
  /**
   * Set to true to run the pre commit hook.
   */
  preCommit: boolean;
  /**
   * Set to true to run the checks before pushing code.
   */
  prePush: boolean;

  /**
   * Set to true to run `pnpm i` after every merge or checkout. Can be overkill.
   */
  postMerge: boolean;

  /**
   * Run certain commands which are needed for the mac environment.
   */
  macPostInstall: boolean;
}

export interface ConfigFile {
  /**
   * The hooks that should be run.
   */
  hooks: HooksConfig;
}

const configFilePath = baseDir('.config.json');

/**
 * Read the JSON from the configuration file.
 */
function readJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    log.error('Invalid JSON data in file .config.json', str);
    throw error;
  }
}

/**
 * Read the configuration file.
 */
export async function readConfigFile(): Promise<ConfigFile> {
  if (!fileExists(configFilePath)) {
    log.warn('No .config.json file');
    return DEFAULT_CONFIG;
  }

  const fileContents = await readFile(configFilePath, { encoding: 'utf-8' });
  return readJSON(fileContents);
}

/**
 * Read the property from the configuration file.
 */
export function readProperty<Return>(
  property: string,
  config: ConfigFile = DEFAULT_CONFIG,
): Return | undefined {
  let item: any = config;

  if (!property || !config) {
    return;
  }

  const keys = property.split('.');

  for (const key of keys) {
    if (key in item) {
      item = item[key];
    } else {
      return;
    }
  }

  return item;
}
