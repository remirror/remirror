import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { logger } from '../logger';
import { fileExists } from './file-exists';
import { getRoot } from './get-root';

export async function formatJson(source: string) {
  const config = await resolvePrettierConfig();
  const c = { parser: 'json', ...config };
  return prettier.format(source, c);
}

let prettierConfig: prettier.Options | null = null;

async function resolvePrettierConfig() {
  if (!prettierConfig) {
    const filePath = await fs.realpath(path.resolve(getRoot(), '.prettierrc.js'));
    const exists = await fileExists(filePath);
    logger.assert(exists, `failed to find prettier config ${filePath}`);
    prettierConfig = await prettier.resolveConfig(filePath);
  }

  return prettierConfig;
}
