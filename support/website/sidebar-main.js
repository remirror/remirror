/**
 * This file is the setup documentation sidebars.
 *
 * @packageDocumentation
 */

const { docs } = require('./sidebar-docs');

// Only require the API when in production.
const api =
  process.env.NODE_ENV === 'production'
    ? { typedocSidebar: require('./sidebars').typedocSidebar }
    : undefined;

module.exports = {
  docs,
  ...api,
};
