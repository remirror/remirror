import { getPackages } from '@manypkg/get-packages';

import { getRoot } from './get-root';

/**
 * Return packages in the monorepo.
 */
export async function listPackages({ isPrivate = null }: { isPrivate?: boolean | null } = {}) {
  const root = getRoot();
  const packages = await getPackages(root);
  return packages.packages.filter((pkg) => {
    const packageIsPrivate = pkg.packageJson.private ?? false;

    if (isPrivate === true) {
      return packageIsPrivate;
    } else if (isPrivate === false) {
      return !packageIsPrivate;
    } else {
      return true;
    }
  });
}
