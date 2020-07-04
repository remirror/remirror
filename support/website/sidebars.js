/** @type import('@docusaurus/plugin-content-docs/lib/types').Sidebar */
const sidebarConfig = {
  main: {
    Remirror: ['introduction'],
    Guides: ['guide/installation', 'guide/hello-world', 'guide/create-editor'],
    Concepts: [
      'concepts/extension',
      'concepts/presets',
      'concepts/remirror-manager',
      'concepts/react-controlled-editor',
      'concepts/priority',
      'concepts/keymap',
    ],
    Showcase: ['showcase/social'],
    Advanced: ['advanced/creating-extensions', 'advanced/naming-conventions'],
    Contribute: ['contributing', 'tooling', 'errors', 'changelog'],
  },
};

module.exports = exports.default = sidebarConfig;
