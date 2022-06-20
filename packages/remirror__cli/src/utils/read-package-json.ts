import fs from 'node:fs/promises';
import path from 'node:path';

export async function readPackageJson(dirPath: string) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  const packageJsonStr = await fs.readFile(packageJsonPath, { encoding: 'utf-8' });
  const packageJson = JSON.parse(packageJsonStr);
  return packageJson;
}
