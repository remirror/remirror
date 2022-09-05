import { logger } from '../logger';
import { isCommonJSModule } from '../utils/is-common-js-module';
import { listPackagesToBuild } from '../utils/list-packages';

const skipPatterns = [/^@types\//];

function skipDep(dep: string): boolean {
  for (const pattern of skipPatterns) {
    if (pattern.test(dep)) {
      return true;
    }
  }

  return false;
}

/**
 * Some packages don't use their package name as the entry point.
 */
const moduleEntryPoints: Record<string, string> = {
  'y-protocols': 'y-protocols/auth',
  'emojibase-data': 'emojibase-data/versions/unicode.json',
  '@babel/runtime': '@babel/runtime/helpers/classCallCheck',
};

export async function checkDeps() {
  logger.debug(`current working directory: ${process.cwd()}`);
  const packages = await listPackagesToBuild();
  const failed = new Set<string>();

  for (const pkg of packages) {
    logger.info(`Checking dependencies of ${pkg.packageJson.name}`);

    const dependencies = Object.keys({
      ...pkg.packageJson.dependencies,
      ...pkg.packageJson.optionalDependencies,
      ...pkg.packageJson.peerDependencies,
    });

    for (let dep of dependencies) {
      dep = moduleEntryPoints[dep] ?? dep;

      if (skipDep(dep)) {
        continue;
      }

      if (!(await isCommonJSModule(pkg.dir, dep))) {
        logger.warn(`Failed to load dependency as a CommonJS module: ${dep}`);
        failed.add(dep);
      }
    }
  }

  if (failed.size > 0) {
    logger.error(
      'Summary: The following dependencies failed to load as CommonJS modules:',
      [...failed].sort(),
    );
    throw new Error("Found dependencies that don't support CommonJS");
  }
}
