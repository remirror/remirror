/**
 * @script
 *
 * This script will make sure that the package `remirror` doesn't depend on `react`.
 */

import { getPackages, Packages } from '@manypkg/get-packages';

import { baseDir, log } from './helpers';

const frameworkDependencies = ['react', 'react-dom', '@types/react', '@types/react-dom'];

function findPath(
  dependentsGraph: Map<string, Set<string>>,
  dependent: string,
  dependency: string,
  depth: number,
): string[] | null {
  if (depth > dependentsGraph.size) {
    throw new Error('found cyclic workspace dependencies');
  }

  const dependencies = dependentsGraph.get(dependent) ?? new Set();

  if (dependencies.has(dependency)) {
    return [dependency, dependent];
  }

  for (const d of dependencies) {
    const path = findPath(dependentsGraph, d, dependency, depth + 1);

    if (path) {
      path.push(dependent);
      return path;
    }
  }

  return null;
}

function getDependentsGraph(packages: Packages): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  for (const pkg of packages.packages) {
    const dependencies: string[] = [];
    dependencies.push(
      ...Object.keys(pkg.packageJson.dependencies ?? {}),
      ...Object.keys(pkg.packageJson.devDependencies ?? {}),
      ...Object.keys(pkg.packageJson.peerDependencies ?? {}),
      ...Object.keys(pkg.packageJson.optionalDependencies ?? {}),
    );
    graph.set(pkg.packageJson.name, new Set(dependencies));
  }

  return graph;
}

function formatPath(path: string[]): string {
  return path.join(' <- ');
}

async function main() {
  const packages = await getPackages(baseDir());
  const dependentsGraph = getDependentsGraph(packages);

  for (const dependency of frameworkDependencies) {
    const path = findPath(dependentsGraph, 'remirror', dependency, 1);

    if (path) {
      log.error(`Package 'remirror' shouldn't depend on ${dependency}. `, formatPath(path));
      process.exit(1);
    }
  }
}

main();
