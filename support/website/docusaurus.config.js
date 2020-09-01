const path = require('path');
const pkg = require('./package.json');
const { baseDir } = require('../scripts/helpers');
const { getPackagesSync } = require('@manypkg/get-packages');

const plugins = [
  path.join(__dirname, 'plugins/monaco-editor'),
  require.resolve('@docusaurus/plugin-ideal-image'),
];

const menuItems = [];

if (process.env.NODE_ENV === 'production') {
  const { compilerOptions } = require('../tsconfig.base.json');

  compilerOptions.lib = ['lib.esnext.full'];
  delete compilerOptions.sourceMap;
  delete compilerOptions.declaration;

  const inputFiles = getPackagesSync(baseDir())
    .packages.filter((pkg) => !!pkg.packageJson.types && !pkg.packageJson.private)
    .map((pkg) => path.join(pkg.dir, 'src'));

  const typedocPlugin = [
    'docusaurus-plugin-typedoc',
    {
      // list of input files relative to project (required).
      inputFiles,
      plugin: ['typedoc-plugin-external-module-name', 'typedoc-plugin-markdown'],

      // docs directory relative to the site directory (defaults to docs).
      docsRoot: baseDir('docs'),
      ignoreCompilerErrors: true,

      // output directory relative to docs directory - use '' for docs root
      // (defaults to 'api').
      out: 'api',

      // Skip updating of sidebars.json (defaults to false).
      skipSidebar: false,
      readme: baseDir('docs/api.md'),
      name: 'remirror',
      mode: 'modules',
      excludePrivate: true,
      excludeNotExported: true,
      excludeExternals: true,
      stripInternal: true,
      includeDeclarations: false,
      logger: 'console',

      ...compilerOptions,
      exclude: [
        '**/__tests__',
        '**/__dts__',
        '**/__mocks__',
        '**/__fixtures__',
        '*.{test,spec}.{ts,tsx}',
        '**/*.d.ts',
        '*.d.ts',
      ],
    },
  ];
  plugins.push(typedocPlugin);
  menuItems.push({
    to: 'api',
    activeBasePath: 'api',
    label: 'API',
    position: 'right',
  });
}

module.exports = {
  title: 'Remirror',
  tagline: pkg.description,
  url: 'https://remirror.io',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  organizationName: 'remirror',
  projectName: 'remirror',
  onBrokenLinks: 'warn',
  themeConfig: {
    image:
      'https://repository-images.githubusercontent.com/166780923/eb30b500-a97f-11ea-8508-32089c11e24c',
    colorMode: { disableSwitch: true },
    navbar: {
      logo: {
        alt: 'Remirror Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'right',
        },
        { to: '/playground', label: 'Playground', position: 'right' },
        { to: '/blog', label: 'Blog', position: 'right' },
        { to: '/chat', label: 'Chat', position: 'right' },
        {
          href: 'https://github.com/remirror/remirror',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs',
            },
            {
              label: 'Installation',
              to: 'docs/guide/installation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Discord', to: '/chat' },
            { label: 'Twitter', href: 'https://twitter.com/ifiokjr' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', to: 'blog' },
            { label: 'GitHub', href: 'https://github.com/remirror/remirror' },
            {
              html: `
                <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Hosted with Netlify">
                  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Hosted with Netlify" />
                </a>
              `,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} KickJump Ltd. Built with Docusaurus`,
    },
    googleAnalytics: { trackingID: 'UA-135738542-1', anonymizeIP: true },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../../docs',
          sidebarPath: baseDir('support/website/sidebar-main.js'),
          editUrl: 'https://github.com/remirror/remirror/edit/next/support/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/remirror/remirror/edit/next/support/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins,
  themes: ['@docusaurus/theme-live-codeblock'],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap',
  ],
};
