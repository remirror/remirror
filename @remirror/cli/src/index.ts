import yargs from 'yargs';
import { bundle } from './commands/bundle';

// eslint-disable-next-line no-unused-expressions
yargs
  .usage('Usage: $0 <cmd> [options]')
  .command(bundle)
  .demandCommand()
  .help('help').argv;
