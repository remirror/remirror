/**
 * @script
 *
 * Mutate the package locally with the provided PR so that it can be published.
 */
import { log } from './helpers';
import { mutatePackageVersions } from './mutatate-packages';

const { PRERELEASE } = process.env;

if (!PRERELEASE) {
  log.error('No `PRERELEASE` environment variable provided.');
  process.exit(1);
}

mutatePackageVersions(PRERELEASE);
