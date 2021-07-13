import { ExtractorLogLevel, IConfigFile } from '@microsoft/api-extractor';
import { Worker as JestWorker } from 'jest-worker';
import os from 'os';
import pLimit from 'p-limit';
import path from 'path';

import type * as CustomWorker from './api-extractor.worker';
import {
  baseDir,
  getAllDependencies,
  getRelativePathFromJson,
  log,
  mangleScopedPackageName,
} from './helpers';

const [, , ...args] = process.argv;
const fix = args.includes('--fix');
const reportFolder = baseDir('support', 'api');
const TEST_WORKER_PATH = require.resolve('../api-extractor.worker');

/**
 * Get all typed packages.
 */
async function getPackages() {
  const packages = await getAllDependencies();

  return packages.filter((pkg) => !pkg.private && pkg.types && !pkg['@remirror']?.skipApi);
}

const worker = new JestWorker(TEST_WORKER_PATH, {
  exposedMethods: ['run'],
  forkOptions: {
    serialization: 'advanced',
    stdio: 'pipe',
  },
  maxRetries: 1,
  numWorkers: os.cpus().length - 1,
}) as JestWorker & typeof CustomWorker;

if (worker.getStdout()) {
  worker.getStdout().pipe(process.stdout);
}

if (worker.getStderr()) {
  worker.getStderr().pipe(process.stderr);
}

/**
 * Run the api extra.
 */
async function runApiExtractor() {
  const packages = await getPackages();
  // const limit = pLimit(os.cpus().length - 1);
  const limit = pLimit(1);
  const promises: Array<Promise<void>> = [];

  for (const json of packages) {
    if (
      json.private ||
      ['jest-prosemirror', 'jest-remirror', '@remirror/cli'].includes(json.name)
    ) {
      continue;
    }

    const typescriptCompilerFolder = baseDir('node_modules', 'typescript');
    const relativePath = getRelativePathFromJson(json);
    const projectFolder = baseDir(relativePath);
    const mainEntryPointFilePath = path.join(projectFolder, json.types ?? '');
    const configObjectFullPath = path.join(projectFolder, 'api-extractor.json');
    const packageJsonFullPath = path.join(projectFolder, 'package.json');
    const reportFileName = `${mangleScopedPackageName(json.name)}.api.md`;
    const reportTempFolder = path.join(reportFolder, 'temp');
    const apiJsonFilePath = path.join(
      reportTempFolder,
      `${mangleScopedPackageName(json.name)}.api.json`,
    );

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

    promises.push(
      limit(() =>
        worker.run({
          configObject,
          configObjectFullPath,
          packageJson: json as any,
          packageJsonFullPath,
          localBuild: !!fix,
          typescriptCompilerFolder,
        }),
      ),
    );
  }

  await Promise.all(promises);
}

async function run() {
  try {
    await runApiExtractor();
  } catch (error) {
    log.fatal(error);
    process.exit(1);
  }
}

run();
