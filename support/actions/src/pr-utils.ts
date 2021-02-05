import got from 'got';
import { parse } from 'semver';
import { isNumber } from '@remirror/core-helpers';

export async function getBuildNumber(tag: string): Promise<number> {
  const json = await got(`https://data.jsdelivr.com/v1/package/resolve/npm/remirror@${tag}`).json<{
    version: string | null;
  }>();

  const version = json.version;
  const parsed = parse(version);

  if (!parsed) {
    return 1;
  }

  const { prerelease } = parsed;
  const [, value] = prerelease;

  return isNumber(value) ? value + 1 : 1;
}
