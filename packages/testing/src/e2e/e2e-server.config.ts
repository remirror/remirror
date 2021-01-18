import { TestServer, TestServerName } from './e2e-types';

const { REMIRROR_E2E_SERVER = 'next' } = process.env;

export const servers: Record<TestServerName, TestServer> = {
  next: {
    environment: 'playwright',
    config: {
      command: 'cd examples/with-next && pnpm dev -- -p 3030',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120_000,
    },
    testMatch: ['examples/with-next/__e2e__/*.test.ts'],
    url: 'http://localhost:3030/',
    name: 'next',
  },

  docs: {
    environment: 'playwright',
    config: {
      command: 'cd support/website && pnpm start -- -p 3031',
      port: 3031,
      usedPortAction: 'kill',
      launchTimeout: 120_000,
    },
    testMatch: ['website/__e2e__/*.test.ts'],
    url: 'http://localhost:3031/',
    name: 'docs',
  },

  'storybook-react': {
    environment: 'playwright',
    config: {
      command: 'cd support/website && pnpm start -- -p 3032',
      port: 3032,
      usedPortAction: 'kill',
      launchTimeout: 120_000,
    },
    testMatch: ['examples/storybook-react/__e2e__/*.test.ts'],
    url: 'http://localhost:3032/iframe.html?id=',
    name: 'storybook-react',
  },
};

export const server: TestServer = servers[REMIRROR_E2E_SERVER];
