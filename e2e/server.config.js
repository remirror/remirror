const {
  REMIRROR_E2E_BROWSER = 'chromium',
  REMIRROR_E2E_SERVER = 'storybook',
  REMIRROR_E2E_BASIC,
} = process.env;

const basicRegex = 'basic\\.e2e\\.test\\.ts$';

const noSSRRegex = REMIRROR_E2E_BASIC
  ? basicRegex
  : `.*\\.(e2e|${REMIRROR_E2E_SERVER})\\.test\\.ts$`;

const getRegex = () => {
  if (REMIRROR_E2E_BASIC) return basicRegex;
  if (REMIRROR_E2E_BROWSER === 'firefox') return noSSRRegex;
  return `.*\\.(e2e|ssr|${REMIRROR_E2E_SERVER})\\.test\\.ts$`;
};
const allTestRegex = getRegex();

const servers = (exports.servers = {
  next: {
    server: {
      command: 'cd examples/with-next && yarn build && yarn start -p 3030',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120000,
    },
    regex: allTestRegex,
    home: 'http://localhost:3030',
  },
  storybook: {
    server: {
      command: 'yarn start-storybook -p 3030 -c support/storybook --quiet --ci',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120000,
    },
    regex: noSSRRegex,
    home: 'http://localhost:3030',
  },
  docs: {
    server: {
      command: 'cd docs && yarn start -p 3030',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120000,
    },
    regex: noSSRRegex,
    home: 'http://localhost:3030',
  },
  razzle: {
    server: {
      command: 'cd examples/with-razzle && PORT=3030 yarn start',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120000,
    },
    regex: allTestRegex,
    home: 'http://localhost:3030',
  },
});

const editors = (exports.editors = {
  social: {
    storybook: {
      empty: 'http://localhost:3030/iframe.html?id=social-editor--basic',
      content: 'http://localhost:3030/iframe.html?id=social-editor--with-content',
    },
    next: {
      empty: 'http://localhost:3030/editor/social',
      content: 'http://localhost:3030/editor/social/content',
    },
    docs: {
      empty: 'http://localhost:3030/showcase/social',
      content: '',
    },
    razzle: {
      empty: 'http://localhost:3030/editors/social',
      content: 'http://localhost:3030/editors/social/content',
    },
  },
  wysiwyg: {
    storybook: {
      empty: 'http://localhost:3030/iframe.html?id=wysiwyg-editor--basic',
      content: 'http://localhost:3030/iframe.html?id=wysiwyg-editor--with-content',
    },
    next: {
      empty: 'http://localhost:3030/editor/wysiwyg',
      content: 'http://localhost:3030/editor/wysiwyg/content',
    },
    docs: {
      empty: 'http://localhost:3030/showcase/wysiwyg',
      content: '',
    },
    razzle: {
      empty: 'http://localhost:3030/editors/wysiwyg',
      content: 'http://localhost:3030/editors/wysiwyg/content',
    },
  },
});

exports.server = {
  ...servers[REMIRROR_E2E_SERVER],
  name: REMIRROR_E2E_SERVER,
  urls: Object.keys(editors).reduce((acc, key) => {
    return {
      ...acc,
      [key]: editors[key][REMIRROR_E2E_SERVER],
    };
  }, {}),
};
