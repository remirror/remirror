import fastDeepEqual from 'fast-deep-equal';
import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '../logger';
import { readPackageJson } from './read-package-json';

export async function writePackageJson(dirPath: string, packageJson: any) {
  const packageJsonPath = path.join(dirPath, 'package.json');

  let existedPackageJson: any = null;

  try {
    existedPackageJson = readPackageJson(dirPath);
  } catch {
    // ignore
  }

  if (existedPackageJson && fastDeepEqual(existedPackageJson, packageJson)) {
    return;
  }

  logger.debug(`writing package.json to ${packageJsonPath}`);
  const packageJsonStr = `${JSON.stringify(packageJson, null, 2)}\n`;
  logger.debug(`package.json content: ${packageJsonStr}`);
  await fs.writeFile(packageJsonPath, packageJsonStr, { encoding: 'utf-8' });
}
