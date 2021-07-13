import {
  Extractor,
  ExtractorConfig,
  IExtractorConfigPrepareOptions,
  IExtractorInvokeOptions,
} from '@microsoft/api-extractor';
import chalk from 'chalk';
import exit from 'exit';

// Make sure uncaught errors are logged before we exit.
process.on('uncaughtException', (err) => {
  console.error(err.stack);
  exit(1);
});

interface RunProps extends IExtractorConfigPrepareOptions, IExtractorInvokeOptions {}

export async function run({
  configObject,
  configObjectFullPath,
  packageJson,
  packageJsonFullPath,
  localBuild,
  typescriptCompilerFolder,
}: RunProps) {
  console.log('Extracting for', packageJson?.name);

  const extractor = ExtractorConfig.prepare({
    configObject,
    configObjectFullPath,
    packageJson,
    packageJsonFullPath,
  });

  const result = Extractor.invoke(extractor, {
    localBuild,
    showVerboseMessages: false,
    typescriptCompilerFolder,
  });

  if (result.succeeded) {
    console.log(chalk`{green.bold ${packageJson?.name} } API check successful.`);
  } else if (!localBuild && result.apiReportChanged) {
    const message = chalk`{red {bold ${packageJson?.name}: } API check failed with {bold ${result.errorCount} errors } and {bold ${result.warningCount} warnings } }\n\nRebuid the project \`pnpm build\` and run: \`pnpm fix:api\` to update the API.\n\n`;
    console.error(message);

    throw new Error(message);
    // process.exit(1);
  }
}
