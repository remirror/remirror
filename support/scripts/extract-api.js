const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const chalk = require('chalk');
const { join } = require('path');
const { promises: fs } = require('fs');

const {
  baseDir,
  getAllDependencies,
  getRelativePathFromJson,
  mangleScopedPackageName,
} = require('./helpers');

const [, , ...args] = process.argv;
const fix = args.includes('--fix');
const reportFolder = baseDir('support', 'api');

/**
 * Get all typed packages.
 */
async function getPackages() {
  const packages = await getAllDependencies();

  return packages.filter((pkg) => !pkg.private && pkg.types && !pkg.meta?.skipApi);
}

/**
 * Override the config.
 *
 * @type import('type-fest').TsConfigJson
 */
const overrideTsconfig = {
  extends: baseDir('support', 'tsconfig.base.json'),
  compilerOptions: {
    noEmit: true,
    isolatedModules: true,
  },
};

/**
 * Run the api extra.
 */
async function runApiExtractor() {
  const packages = await getPackages();

  for (const json of packages) {
    const typescriptCompilerFolder = baseDir('node_modules', 'typescript');
    const relativePath = getRelativePathFromJson(json);
    const projectFolder = baseDir(relativePath);
    const mainEntryPointFilePath = join(projectFolder, json.types);
    const configObjectFullPath = join(projectFolder, 'api-extractor.json');
    const packageJsonFullPath = join(projectFolder, 'package.json');
    const reportFileName = `${mangleScopedPackageName(json.name)}.api.md`;
    const reportTempFolder = join(reportFolder, 'temp');
    const apiJsonFilePath = join(
      reportTempFolder,
      `${mangleScopedPackageName(json.name)}.api.json`,
    );

    /** @type import('@microsoft/api-extractor').IConfigFile */
    const configObject = {
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
      compiler: { overrideTsconfig },
      messages: {
        tsdocMessageReporting: {
          default: {
            logLevel: 'none',
            addToApiReportFile: false,
          },
        },
        compilerMessageReporting: {
          default: {
            logLevel: 'none',
            addToApiReportFile: false,
          },
        },
        extractorMessageReporting: {
          default: {
            logLevel: 'none',
            addToApiReportFile: false,
          },
        },
      },
    };

    const extractor = ExtractorConfig.prepare({
      configObject,
      configObjectFullPath,
      packageJson: json,
      packageJsonFullPath,
    });

    const result = Extractor.invoke(extractor, {
      localBuild: !!fix,
      showVerboseMessages: false,
      typescriptCompilerFolder,
    });

    if (result.succeeded) {
      console.log(chalk`{green.bold ${json.name} } API check successful.`);
    } else if (!fix && result.apiReportChanged) {
      console.error(
        chalk`{red {bold ${json.name}: } API check failed with {bold ${result.errorCount} errors } and {bold ${result.warningCount} warnings } }\n\nRebuid the project \`pnpm build\` and run: \`pnpm fix:api\` to update the API.\n\n`,
      );

      process.exitCode = 1;
    }
  }
}

const patchFilePath = require.resolve('@microsoft/api-extractor/lib/analyzer/ExportAnalyzer.js');
let originalContent = '';

async function patchFile() {
  const content = await fs.readFile(patchFilePath, 'utf8');
  const updatedContent = content.replace(
    `throw new Error('The expression contains an import()`,
    `function __noop(){} __noop('The expression contains an import()`,
  );

  if (content === updatedContent) {
    return;
  }

  originalContent = content;
  await fs.writeFile(patchFilePath, updatedContent);
}

async function restoreFile() {
  if (!originalContent) {
    return;
  }

  await fs.writeFile(patchFilePath, originalContent);
}

async function run() {
  await patchFile();
  await runApiExtractor();
  await restoreFile();
}

run();
