const path = require('path');
const pkg = require('./package.json');

module.exports = {
  title: 'Remirror',
  tagline: pkg.description,
  url: 'https://remirror.io',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  organizationName: 'remirror', // Usually your GitHub org/user name.
  projectName: 'remirror', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      logo: {
        alt: 'Remirror Logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/introduction',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'right',
        },
        { to: 'playground', label: 'Playground', position: 'right' },
        { to: 'blog', label: 'Blog', position: 'right' },
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
              to: 'docs/introduction',
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
            {
              label: 'Discord',
              href: 'https://discord.gg/C4cfrMK',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/ifiokjr',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/remirror/remirror',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ifiok Jr.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../../docs',
          // It is recommended to set document id as docs home page (`docs/` path).
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/remirror/remirror/edit/next/docs/',
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
  plugins: [
    path.join(__dirname, 'plugins/monaco-editor'),
    require.resolve('@docusaurus/plugin-ideal-image'),
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
};
