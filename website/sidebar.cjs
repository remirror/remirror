const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../docs/api');

function getApiItems() {
  if (!fs.existsSync(API_DIR)) {
    return [];
  }

  const apiItems = [];

  /*
    apiFiles is an array like this:
    [
      'api/index',
      'api/prosemirror-paste-rules',
      'api/prosemirror-paste-rules.filedrophandlerprops',
      'api/prosemirror-paste-rules.filedrophandlerprops.pos',
      'api/prosemirror-paste-rules.filedrophandlerprops.type',
      'api/prosemirror-paste-rules.filedrophandlerprops.view',
      'api/prosemirror-paste-rules.nodepasterule',
      'api/prosemirror-paste-rules.nodepasterule.nodetype',
      'api/prosemirror-paste-rules.nodepasterule.type',
    ]
  */
  const apiFiles = fs
    .readdirSync(API_DIR)
    .map((name) => `api/${name.replace(/\.mdx?$/, '')}`)
    .sort((a, b) => {
      if (a === 'api/index') {
        return -1;
      } else if (a < b) {
        return -1;
      }

      return +1;
    });

  for (const apiFile of apiFiles) {
    const [root, rest] = apiFile.split('.', 2);

    // We don't want to give every page a position in the sidebar
    if (apiFile.split('.').length >= 2) {
      continue;
    }

    const packageName = apiFile.replace(/^api\//, '');
    apiItems.push({
      type: 'doc',
      label: packageName,
      id: apiFile,
    });
  }

  return apiItems;
}

const docs = [
  'introduction',
  '5-min-tutorial',
  {
    type: 'category',
    label: 'Getting started',
    collapsed: false,
    items: [
      'getting-started/installation',
      'getting-started/create-manager',
      'getting-started/render-editor',
      'getting-started/commands-and-helpers',
      'getting-started/custom-extension',
    ],
  },
  {
    type: 'link',
    label: 'Storybook',
    href: 'https://remirror.vercel.app/',
  },
  {
    type: 'category',
    label: 'Showcase',
    items: ['showcase/richtext', 'showcase/markdown', 'showcase/social'],
  },
  {
    type: 'category',
    label: 'Core concepts',
    items: [
      'concepts/extension',
      'concepts/remirror-manager',
      'concepts/extra-attributes',
      'concepts/priority',
      'concepts/keymap',
      'concepts/error-handling',
      'concepts/styling',
    ],
  },
  {
    type: 'category',
    label: 'Extensions',
    collapsed: true,
    items: fs
      .readdirSync(path.join(__dirname, '../docs/extensions'))
      .sort((a, b) => (a === 'index.md' ? -1 : 0))
      .map((name) => `extensions/${name.replace(/\.mdx?$/, '')}`),
  },
  {
    type: 'category',
    label: 'Hooks',
    collapsed: true,
    items: fs
      .readdirSync(path.join(__dirname, '../docs/hooks'))
      .map((name) => `hooks/${name.replace(/\.mdx?$/, '')}`),
  },
  'controlled-editor',
  'static-rendering',
  {
    type: 'category',
    label: 'Advanced',
    items: [
      'advanced/updating-editor-externally',
      'advanced/creating-extensions',
      'advanced/naming-conventions',
      'advanced/browser-support',
    ],
  },
  'faq',
  {
    type: 'category',
    label: 'More',
    items: ['contributing', 'tooling', 'errors', 'projects'],
  },
  'migration-v2',
  'migration-v3',
];

if (getApiItems().length > 0) {
  docs.push({
    type: 'category',
    label: 'API',
    collapsed: true,
    items: getApiItems(),
  });
}

module.exports.docs = docs;
