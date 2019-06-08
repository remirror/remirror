const fs = require('fs');
const { sync } = require('glob');

sync('./node_modules/@emotion/*/package.json').forEach(src => {
  const packageJSON = JSON.parse(fs.readFileSync(src, 'utf-8'));
  const browser = packageJSON.browser;
  delete packageJSON.browser;
  if (browser) {
    packageJSON._browser = browser;
  }
  fs.writeFileSync(src, JSON.stringify(packageJSON, null, 2));
});
