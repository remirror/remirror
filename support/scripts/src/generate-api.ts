import { getPackages } from '@manypkg/get-packages';
import {
  Extractor,
  ExtractorConfig,
  ExtractorLogLevel,
  ExtractorResult,
  IConfigFile,
} from '@microsoft/api-extractor';
import path from 'path';

import { baseDir, mangleScopedPackageName } from './helpers';

const reportFolderRoot = baseDir('support', 'api');
const reportTempFolderRoot = baseDir('support', 'api', 'temp');
const typedPackages = new Set([
  'prosemirror-suggest',
  'prosemirror-trailing-node',
  '@remirror/extension-strike',
]);

/**
 * Get all typed packages.
 */
async function getTypedPackages() {
  const packages = await getPackages(baseDir());

  return packages.packages.filter((pkg) => {
    const json = pkg.packageJson;
    return !json.private && typedPackages.has(json.name);
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
    const relativePath = path.relative(baseDir(), pkg.dir);
    const projectFolder = baseDir(relativePath);
    const mainEntryPointFilePath = path.join(pkg.dir, (json as any).types ?? '');
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
      messages: {
        tsdocMessageReporting: {
          default: {
            logLevel: 'none' as ExtractorLogLevel,
            addToApiReportFile: false,
          },
        },
        compilerMessageReporting: {
          default: {
            logLevel: 'none' as ExtractorLogLevel,
            addToApiReportFile: false,
          },
        },
        extractorMessageReporting: {
          default: {
            logLevel: 'none' as ExtractorLogLevel,
            addToApiReportFile: false,
          },
        },
      },
    };

    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
      configObject,
      configObjectFullPath: undefined,
      packageJson: json as any,
      packageJsonFullPath,
    });

    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,

      // Equivalent to the "--verbose" command-line parameter
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      console.log(`API Extractor completed successfully`);
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
}

run();
