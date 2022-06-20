import fs from 'node:fs';

/**
 * Check if a file exists for the provide `filePath` the provided target.
 *
 * @param {string} filePath
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = fs.lstatSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
