const path = require('path');
const pkg = require('./package.json');

module.exports = {
  title: 'Remirror',
  tagline: pkg.description,
  url: 'https://remirror.io',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      logo: {
        alt: 'Remirror Logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'right',
        },
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
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/remirror',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/remirror',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/remirrorio',
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
      copyright: `Copyright © ${new Date().getFullYear()} KickJump. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../../docs',
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'index',
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
  plugins: [path.join(__dirname, 'plugins/monaco-editor')],
};
