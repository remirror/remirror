const baseBabel = require('../babel/base.babel');
const { resolve } = require('path');

const moduleResolver = [
  'module-resolver',
  {
    alias: {
      '@remirror/dev': '../../@remirror/dev/src',
      '@remirror/core': '../../@remirror/core/src',
      '@remirror/core-extensions': '../../@remirror/core-extensions/src',
      '@remirror/editor-markdown': '../../@remirror/editor-markdown/src',
      '@remirror/editor-social': '../../@remirror/editor-social/src',
      '@remirror/editor-wysiwyg': '../../@remirror/editor-wysiwyg/src',
      '@remirror/extension-code-block': '../../@remirror/extension-code-block/src',
      '@remirror/extension-emoji': '../../@remirror/extension-emoji/src',
      '@remirror/extension-enhanced-link': '../../@remirror/extension-enhanced-link/src',
      '@remirror/extension-epic-mode': '../../@remirror/extension-epic-mode/src',
      '@remirror/extension-image': '../../@remirror/extension-image/src',
      '@remirror/extension-mention': '../../@remirror/extension-mention/src',
      '@remirror/react': '../../@remirror/react/src',
      '@remirror/react-utils': '../../@remirror/react-utils/src',
      '@remirror/react-ssr': '../../@remirror/react-ssr/src',
      '@remirror/renderer-react': '../../@remirror/renderer-react/src',
      '@remirror/showcase': '../../@remirror/showcase/src',
      '@remirror/ui': '../../@remirror/ui/src',
      remirror: '../../packages/remirror/src',
    },
    cwd: resolve(__dirname),
  },
];

module.exports = {
  ...baseBabel,
  plugins: [...baseBabel.plugins, moduleResolver],
  sourceType: 'unambiguous',
};
