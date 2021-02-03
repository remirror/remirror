/**
 * @script
 *
 * Mutate the package locally with the provided PR so that it can be published.
 */
import { log } from './helpers';
import { mutatePackageVersions } from './mutatate-packages';

const { TAG } = process.env;

if (!TAG) {
  log.error('No `TAG` environment variable provided.');
  process.exit(1);
}

mutatePackageVersions(TAG);
