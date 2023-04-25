import fastDeepEqual from 'fast-deep-equal';
import path from 'node:path';
import { writePackage } from 'write-pkg';

import { logger } from '../logger';
import { readPackageJson } from './read-package-json';

export async function writePackageJson(dirPath: string, packageJson: any) {
  const packageJsonPath = path.join(dirPath, 'package.json');

  let existedPackageJson: any = null;

  try {
    existedPackageJson = await readPackageJson(dirPath);
  } catch {
    // ignore
  }

  if (existedPackageJson && jsonEqual(existedPackageJson, packageJson)) {
    return;
  }

  logger.debug(`writing package.json to ${packageJsonPath}`);
  await writePackage(packageJsonPath, packageJson, { indent: '  ' });
}

function jsonEqual(a: any, b: any): boolean {
  return fastDeepEqual(normalizeJson(a), normalizeJson(b));
}

function normalizeJson(json: any) {
  return JSON.parse(JSON.stringify(json));
}
