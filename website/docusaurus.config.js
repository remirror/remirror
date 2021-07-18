const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

module.exports = {
  title: 'Remirror',
  tagline: pkg.description,
  url: 'https://remirror.io',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  organizationName: 'remirror', // Usually your GitHub org/user name.
  projectName: 'remirror', // Usually your repo name.
  themeConfig: {
    image:
      'https://repository-images.githubusercontent.com/166780923/eb30b500-a97f-11ea-8508-32089c11e24c',
    colorMode: {
      // "light" | "dark"
      defaultMode: 'light',

      // Hides the switch in the navbar
      // Useful if you want to support a single color mode
      disableSwitch: true,

      // Should we use the prefers-color-scheme media-query,
      // using user system preferences, instead of the hardcoded defaultMode
      respectPrefersColorScheme: true,
    },
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
              to: 'docs/installation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Discord', to: '/chat' },
            { label: 'Twitter', href: 'https://twitter.com/@remirrorio' },
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
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    googleAnalytics: { trackingID: 'UA-135738542-1', anonymizeIP: true },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: path.join(__dirname, '../docs'),
          sidebarPath: require.resolve('./sidebar.js'),
          editUrl: 'https://github.com/remirror/remirror/edit/HEAD/website/',
          // remarkPlugins: [require('remark-footnotes')],
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/remirror/remirror/edit/HEAD/website/blog/',
          // remarkPlugins: [require('remark-footnotes')],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    path.join(__dirname, 'plugins', 'basic-plugin.js'),
    require.resolve('@docusaurus/plugin-ideal-image'),
    [
      'docusaurus-plugin-content-examples',
      {
        path: path.join(__dirname, 'examples'),
        include: ['*.{js,jsx,ts,tsx}'],
        exclude: ['*.test.{js,jsx,ts,tsx}'],
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap',
  ],
};
