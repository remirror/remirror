require('source-map-support').install();
require('ts-node').register({ transpileOnly: true });

module.exports = require('./gatsby-config.ts');
