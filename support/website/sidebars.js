/** @type import('@docusaurus/plugin-content-docs/lib/types').Sidebar */
const sidebarConfig = {
  main: {
    Remirror: ['introduction'],
    Guides: [
      'guide/installation',
      'guide/hello-world',
      'guide/priority',
      'guide/react',
      'guide/custom-keys',
    ],
    Concepts: ['concepts/extension', 'concepts/presets', 'concepts/remirror-manager'],
    Showcase: ['showcase/social'],
    Advanced: [
      'advanced/creating-extensions',
      'advanced/naming-conventions',
      'advanced/react-controlled',
    ],
    API: ['api/index'],
    Contribute: ['contributing', 'tooling'],
  },
};

/** @type import(').DocsSidebar */
module.exports = exports.default = sidebarConfig;
