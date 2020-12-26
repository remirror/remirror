/** @type import('@docusaurus/plugin-content-docs/lib/types').SidebarItem[] */
const docs = [
  {
    type: 'category',
    label: 'Remirror',
    items: ['introduction', 'contributing', 'tooling', 'errors', 'projects', 'faq'],
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
      'concepts/react-refs',
      'concepts/priority',
      'concepts/keymap',
      'concepts/error-handling',
    ],
  },
  { type: 'category', label: 'Showcase', items: ['showcase/social'] },
  {
    type: 'category',
    label: 'Advanced',
    items: ['advanced/creating-extensions', 'advanced/naming-conventions'],
  },
  {
    type: 'doc',
    id: 'api/index',
  },
];

module.exports.docs = docs;
