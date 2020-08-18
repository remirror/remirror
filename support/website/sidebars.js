/** @type import('@docusaurus/plugin-content-docs/lib/types').Sidebar */
const sidebarConfig = {
  main: [
    {
      type: 'category',
      label: 'Remirror',
      items: ['introduction', 'contributing', 'tooling', 'errors', 'projects'],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: ['guide/installation', 'guide/hello-remirror', 'guide/create-editor'],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/extension',
        'concepts/presets',
        'concepts/remirror-manager',
        'concepts/react-controlled-editor',
        'concepts/priority',
        'concepts/keymap',
      ],
    },
    { type: 'category', label: 'Showcase', items: ['showcase/social'] },
    {
      type: 'category',
      label: 'Advanced',
      items: ['advanced/creating-extensions', 'advanced/naming-conventions'],
    },
  ],
};

module.exports = exports.default = sidebarConfig;
