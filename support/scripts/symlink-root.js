const fs = require('fs');
const path = require('path');
const { baseDir } = require('./helpers');

const files = fs
  .readdirSync(baseDir('support', 'root'))
  .map((filename) => ({ path: baseDir('support', 'root', filename), target: baseDir(filename) }));

// for (const file of files) {
//   fs.symlinkSync(file);
// }
console.log(files);
