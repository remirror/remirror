import externalLinks from 'remark-external-links';

export default {
  title: 'Remirror',
  files: '**/*.{md,markdown,mdx}',
  description: 'A world class text editor for every JavaScript environment',
  repository: 'https://github.com/ifiokjr/remirror',
  propsParser: false,
  indexHtml: 'public/index.html',
  ordering: 'ascending',
  mdPlugins: [externalLinks],
  htmlContext: {
    favicon:
      'https://raw.githubusercontent.com/ifiokjr/remirror/master/support/assets/favicon.ico',
  },
  menu: [
    'Introduction',
    { name: 'Guides', menu: ['Quickstart Guide'] },
    'Showcase',
    'Examples',
    'Terminology',
    'API',
  ],
  typescript: true,
  public: 'public/images/favicon.ico',
  themeConfig: {
    repository: 'https://github.com/ifiokjr/remirror',
    colors: {
      primary: '#37393A',
      link: '#77B6EA',
    },
    logo: {
      src:
        'https://raw.githubusercontent.com/ifiokjr/remirror/master/support/assets/logo.svg?sanitize=true',
      width: 200,
    },
  },
};
