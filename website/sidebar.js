/** @type import('@docusaurus/plugin-content-docs/lib/types').SidebarItem[] */
const docs = [
  'introduction',
  'installation',
  {
    type: 'category',
    label: 'React',
    collapsed: false,
    items: ['react/create-editor', 'react/controlled', 'react/hooks', 'react/refs'],
  },
  {
    type: 'category',
    label: 'Core',
    items: [
      'concepts/extension',
      'concepts/remirror-manager',
      'concepts/extra-attributes',
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
  'faq',
  {
    type: 'category',
    label: 'More',
    items: ['contributing', 'tooling', 'errors', 'projects'],
  },
];

module.exports.docs = docs;
