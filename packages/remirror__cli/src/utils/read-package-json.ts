import fs from 'node:fs';
import path from 'node:path';

export function readPackageJson(dirPath: string) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  const packageJsonStr = fs.readFileSync(packageJsonPath, { encoding: 'utf-8' });
  const packageJson = JSON.parse(packageJsonStr);
  return packageJson;
}
