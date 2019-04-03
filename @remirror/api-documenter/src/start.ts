import colors from 'colors';
import os from 'os';

import { PackageJsonLookup } from '@microsoft/node-core-library';

import { ApiDocumenterCommandLine } from './cli/api-documenter-command-line';

const myPackageVersion: string = PackageJsonLookup.loadOwnPackageJson(__dirname).version;

console.log(
  os.EOL +
    colors.bold(
      `api-documenter ${myPackageVersion} ` + colors.cyan(' - https://api-extractor.com/') + os.EOL,
    ),
);

const parser: ApiDocumenterCommandLine = new ApiDocumenterCommandLine();

parser.execute().catch(console.error); // CommandLineParser.execute() should never reject the promise
