const path = require('path');
const fs = require('fs');

const pnpmLocation = path.join(path.dirname(require.resolve('@changesets/cli')), 'cli.cjs.dev.js');

const contents = fs.readFileSync(pnpmLocation, 'utf-8');
const updatedContents = contents.replace(/pnpm/gm, 'npm');

fs.writeFileSync(pnpmLocation, updatedContents);
console.log(`\u001B[32mSuccessfully removed 'pnpm' from 'changesets'.\u001B[0m`);
