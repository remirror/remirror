const fs = require('fs');
const path = require('path');

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

/** @type import('@docusaurus/plugin-content-docs/lib/types').SidebarItem[] */
const api = [
  'api',
  {
    type: 'category',
    label: 'Packages',
    collapsed: true,
    items: fs
      .readdirSync(path.join(__dirname, '../docs/packages'))
      .map((name) => `packages/${name.replace(/\.md$/, '')}`),
  },
  {
    type: 'category',
    label: 'Extensions',
    collapsed: true,
    items: fs
      .readdirSync(path.join(__dirname, '../docs/extensions'))
      .map((name) => `extensions/${name.replace(/\.md$/, '')}`),
  },
  {
    type: 'category',
    label: 'Commands',
    collapsed: true,
    items: fs
      .readdirSync(path.join(__dirname, '../docs/commands'))
      .map((name) => `commands/${name.replace(/\.md$/, '')}`),
  },
  {
    type: 'category',
    label: 'Hooks',
    collapsed: true,
    items: fs
      .readdirSync(path.join(__dirname, '../docs/hooks'))
      .map((name) => `hooks/${name.replace(/\.md$/, '')}`),
  },
];

exports.docs = docs;
exports.api = api;
