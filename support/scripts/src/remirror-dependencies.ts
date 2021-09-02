/**
 * @script
 *
 * This script will make sure that the package `remirror` doesn't depend on `react`.
 */

import { getPackages } from '@manypkg/get-packages';

import { baseDir, getAllDependencies } from '.';

function main() {
  const packages = getPackages(baseDir());
  console.log('packages:', packages);
}

main();
