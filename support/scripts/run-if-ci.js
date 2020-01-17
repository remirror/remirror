const { execSync } = require('child_process');

const [, , ...args] = process.argv;
const command = args.join(' ');
const { CI } = process.env;

if (!CI || CI === 'false') {
  console.log(`not 'CI' - skipping command: '${command}'\n\n`);
  process.exit(0);
}

execSync(command, { stdio: 'inherit' });
