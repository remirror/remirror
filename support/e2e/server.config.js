const {
  REMIRROR_E2E_BROWSER = 'chromium',
  REMIRROR_E2E_SERVER = 'next',
  REMIRROR_E2E_BASIC,
} = process.env;

const browsers = REMIRROR_E2E_BROWSER.split(',');

const basicRegex = 'basic\\.e2e\\.test\\.ts$';

const noSSRRegex = REMIRROR_E2E_BASIC
  ? basicRegex
  : `.*\\.(e2e|${REMIRROR_E2E_SERVER})\\.test\\.ts$`;

function getRegex() {
  if (REMIRROR_E2E_BASIC) {
    return basicRegex;
  }

  if (browsers.includes('firefox')) {
    return noSSRRegex;
  }

  return `.*\\.(e2e|ssr|${REMIRROR_E2E_SERVER})\\.test\\.ts$`;
}

const allTestRegex = getRegex();

const servers = (exports.servers = {
  next: {
    server: {
      command: 'cd ../../examples/with-next && pnpm dev -- -p 3030',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120000,
    },
    regex: allTestRegex,
    home: 'http://localhost:3030',
  },

  docs: {
    server: {
      command: 'cd ../website && pnpm start -- -p 3030',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120000,
    },
    regex: noSSRRegex,
    home: 'http://localhost:3030',
  },
});

const editors = (exports.editors = {
  positioner: {
    next: {
      empty: 'http://localhost:3030/editor/positioner',
    },
  },
  social: {
    next: {
      empty: 'http://localhost:3030/editor/social',
      content: 'http://localhost:3030/editor/social/content',
    },
    docs: {
      empty: 'http://localhost:3030/testing/social',
      content: 'http://localhost:3030/testing/social/content',
    },
  },
  wysiwyg: {
    next: {
      empty: 'http://localhost:3030/editor/wysiwyg',
      content: 'http://localhost:3030/editor/wysiwyg/content',
    },
    docs: {
      empty: 'http://localhost:3030/testing/wysiwyg',
      content: 'http://localhost:3030/testing/wysiwy/content',
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
