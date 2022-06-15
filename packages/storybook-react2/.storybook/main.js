module.exports = {
  stories: [
    // '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../stories/**/introduction.stories.@(js|jsx|ts|tsx)',

    '../stories/**/italic.stories.@(js|jsx|ts|tsx)',
    '../stories/**/code.stories.@(js|jsx|ts|tsx)',

    '../stories/extension-annotation/annotation-extension.stories.tsx',
    '../stories/extension-blockquote/blockquote.stories.tsx',
    '../stories/extension-bold/bold.stories.jsx',
    '../stories/extension-callout/callout.stories.tsx',
    '../stories/extension-code-block/code-block.stories.tsx',
    '../stories/extension-code/code.stories.tsx',
    '../stories/extension-codemirror5/codemirror5.stories.tsx',
    '../stories/extension-codemirror6/codemirror6.stories.tsx',
    '../stories/extension-columns/columns.stories.tsx',
    '../stories/extension-count/count.stories.tsx',

    '../stories/extension-decoration/decoration.stories.tsx',
    '../stories/extension-drop-cursor/drop-cursor.stories.tsx',
    '../stories/extension-embed/iframe.stories.tsx',
    '../stories/extension-epic-mode/epic-mode.stories.tsx',
    '../stories/extension-file/file.stories.tsx',
    '../stories/extension-font-family/font-family.stories.tsx',
    '../stories/extension-font-size/font-size.stories.tsx',
    '../stories/extension-hard-break/hard-break.stories.tsx',
    '../stories/extension-heading/heading.stories.tsx',
    '../stories/extension-horizontal-rule/horizontal-rule.stories.tsx',
    '../stories/extension-image/image.stories.tsx',
    '../stories/extension-italic/italic.stories.tsx',

    '../stories/extension-link/link-extension.stories.tsx',

    '../stories/extension-list/list-extension.stories.tsx',
    '../stories/extension-node-formatting/node-formatting.stories.tsx',
    '../stories/extension-placeholder/placeholder-extension.stories.tsx',
    '../stories/extension-positioner/positioner-extension.stories.tsx',
    '../stories/extension-react-tables/react-tables-extension.stories.tsx',
    '../stories/extension-shortcuts/shortcuts.stories.tsx',
    '../stories/extension-strike/strike.stories.tsx',
    '../stories/extension-sub/sub.stories.tsx',
    '../stories/extension-sup/sup.stories.tsx',
    '../stories/extension-tables/table.stories.tsx',
    '../stories/extension-text-case/text-case.stories.tsx',
    '../stories/extension-text-color/text-color.stories.tsx',
    '../stories/extension-text-highlight/text-highlight.stories.tsx',
    '../stories/extension-underline/underline.stories.tsx',
    '../stories/extension-yjs/yjs.stories.tsx',
    '../stories/react-components/emoji-popup.stories.tsx',
    // '../stories/react-components/floating-menu.stories.tsx',
    // '../stories/react-components/mention-atom-popup.stories.tsx',
    // '../stories/react-components/toolbar.stories.tsx',
    '../stories/react-editors/markdown-editor.stories.tsx',
    // '../stories/react-editors/social-editor.stories.tsx',
    // '../stories/react-editors/wysiwyg-editor.stories.tsx',
    // '../stories/react-hooks/use-mention-atom.stories.tsx',
    // '../stories/react-hooks/use-mention.stories.tsx',
    // '../stories/react-renderer/react-renderer.stories.tsx',
    // '../stories/react/controlled.stories.tsx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  core: {
    builder: 'webpack5',
    options: {
      lazyCompilation: true,
    },
  },
  features: {
    storyStoreV7: true,
  },

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Disable fullySpecified
    config.resolve.fullySpecified = false;
    // console.log('config:', config);

    // // Make whatever fine-grained changes you need
    // config.module.rules.push({
    //   test: /\.scss$/,
    //   use: ['style-loader', 'css-loader', 'sass-loader'],
    //   include: path.resolve(__dirname, '../'),
    // });

    // Return the altered config
    return config;
  },
};
