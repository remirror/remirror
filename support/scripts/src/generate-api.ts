import { getPackages } from '@manypkg/get-packages';
import { Extractor, ExtractorConfig, ExtractorResult, IConfigFile } from '@microsoft/api-extractor';
import { remove } from 'fs-extra';
import path from 'path';

import { baseDir, mangleScopedPackageName } from './helpers';

const reportFolderRoot = baseDir('support', 'api');
const reportTempFolderRoot = baseDir('support', 'api', 'temp');
const ignorePackages = new Set([
  // These packages below will throw errors. Need to fix them later.
  'jest-remirror',
  '@remirror/cli',
  '@remirror/messages',
  '@remirror/pm',
  '@remirror/react-utils',
  '@remirror/styles',
  '@remirror/theme',

  // These packages are not a part of remirror
  'a11y-status',
  'test-keyboard',
]);

/**
 * Get all typed packages.
 */
async function getTypedPackages() {
  const packages = await getPackages(baseDir());

  return packages.packages.filter((pkg) => {
    const json = pkg.packageJson;
    return !json.private && !ignorePackages.has(json.name);
  });
}

/**
 * Run the api extra.
 */
async function runApiExtractor() {
  const packages = await getTypedPackages();

  for (const pkg of packages) {
    const json = pkg.packageJson;
    const name = mangleScopedPackageName(json.name);
    const types = (json as any).types;

    if (!types) {
      throw new Error(`unable to find "types" in ${pkg.dir}`);
    }

    const relativePath = path.relative(baseDir(), pkg.dir);
    const projectFolder = baseDir(relativePath);
    const mainEntryPointFilePath = path.join(pkg.dir, types);
    const packageJsonFullPath = path.join(pkg.dir, 'package.json');
    const apiJsonFilePath = path.join(reportFolderRoot, `${name}.api.json`);
    const reportFilePath = path.join(reportFolderRoot, `${name}.api.md`);
    const reportTempFilePath = path.join(reportTempFolderRoot, `${name}.api.md`);
    const reportFileName = path.parse(reportFilePath).base;
    const reportFolder = path.parse(reportFilePath).dir;
    const reportTempFolder = path.parse(reportTempFilePath).dir;

    const configObject: IConfigFile = {
      projectFolder,
      mainEntryPointFilePath,
      apiReport: {
        enabled: true,
        reportFolder,
        reportFileName,
        reportTempFolder,
      },
      docModel: {
        enabled: true,
        apiJsonFilePath,
      },
      compiler: {
        tsconfigFilePath: path.join(projectFolder, 'src', 'tsconfig.json'),
        skipLibCheck: true,
      },
    };

    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
      configObject,
      configObjectFullPath: undefined,
      packageJson: json as any,
      packageJsonFullPath,
    });

    console.log(`running API Extractor for ${json.name}`);

    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,

      // Equivalent to the "--verbose" command-line parameter
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      console.log(`successfully completed API Extractor for ${json.name}`);
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`,
      );
      throw new Error('failed to run API Extractor');
    }
  }
}

async function run() {
  await runApiExtractor();
  await remove(reportTempFolderRoot);
}

run();
