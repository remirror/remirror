// workaround for https://github.com/atlassian/changesets/issues/476
//
// For example, if you add `@remirror/extension-text-color` into a changeset,
// then run this script, you will get a new changeset that conatains not only
// `@remirror/extension-text-color`, but also `remirror` because `remirror`
// depends on `@remirror/extension-text-color`.
//

import readChangesets from '@changesets/read';
import { VersionType } from '@changesets/types';
import writeChangesets from '@changesets/write';
import path from 'path';

import { getAllDependencies, rm } from './helpers';

async function getDependencyMap(): Promise<Record<string, Set<string>>> {
  const dependencyMap: Record<string, Set<string>> = {};

  for (const pkg of await getAllDependencies({
    excludeDeprecated: true,
    excludeSupport: true,
    excludePrivate: true,
  })) {
    const dependent: string = pkg.name;

    for (const dependency of Object.keys(pkg.dependencies ?? {})) {
      if (!dependencyMap[dependent]) {
        dependencyMap[dependent] = new Set();
      }

      dependencyMap[dependent]!.add(dependency);
    }
  }

  for (const [dependent, dependencies] of Object.entries(dependencyMap)) {
    while (true) {
      const size = dependencies.size;
      const deepDependencies = new Set<string>();

      for (const dependency of dependencies) {
        for (const deepDependency of dependencyMap[dependency] ?? new Set()) {
          deepDependencies.add(deepDependency);
        }
      }

      deepDependencies.forEach((deepDependency) => dependencies.add(deepDependency));

      if (dependencies.size === size) {
        break;
      }
    }

    if (dependencies.has(dependent)) {
      throw new Error(`package '${dependent}' depend on itself`);
    }
  }

  return dependencyMap;
}

async function getDependentMap(): Promise<Record<string, Set<string>>> {
  const dependencyMap: Record<string, Set<string>> = await getDependencyMap();
  const dependentMap: Record<string, Set<string>> = {};

  for (const [dependent, dependencies] of Object.entries(dependencyMap)) {
    for (const dependency of dependencies) {
      if (!dependentMap[dependency]) {
        dependentMap[dependency] = new Set();
      }

      dependentMap[dependency]!.add(dependent);
    }
  }

  return dependentMap;
}

async function run() {
  const cwd = process.cwd();
  const dependentMap: Record<string, Set<string>> = await getDependentMap();
  const changesets = await readChangesets(cwd);
  await rm(path.join(cwd, '.changeset', '*.md'));

  for (const changeset of changesets) {
    const releaseMap: Record<string, VersionType> = {};

    for (const release of changeset.releases) {
      releaseMap[release.name] = release.type;
    }

    for (const dependency of Object.keys(releaseMap)) {
      for (const dependent of dependentMap[dependency] ?? new Set()) {
        if (!releaseMap[dependent]) {
          releaseMap[dependent] = 'patch';
          changeset.releases.push({ name: dependent, type: 'patch' });
        }
      }
    }

    writeChangesets(changeset, cwd);
  }
}

run();
