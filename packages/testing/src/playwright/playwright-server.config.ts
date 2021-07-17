import { TestServer, TestServerName } from './playwright-types';

const { E2E_SERVER = 'storybook-react', E2E_MODE = 'development' } = process.env;
const dev = E2E_MODE === 'development';

export const servers: Record<TestServerName, TestServer> = {
  next: {
    environment: 'playwright',
    config: {
      command: dev
        ? 'cd examples/with-next && pnpm dev -- -p 3030'
        : 'cd examples/with-next && pnpm build && pnpm start -- -p 3030',
      port: 3030,
      usedPortAction: 'kill',
      launchTimeout: 120_000,
    },
    testMatch: ['examples/with-next/__e2e__/**/*.test.ts'],
    url: 'http://localhost:3030/',
    name: 'next',
  },

  docs: {
    environment: 'playwright',
    config: {
      command: dev
        ? 'cd website && pnpm start -- -p 3031'
        : 'cd website && pnpm build && pnpx http-server build --p 3031',
      port: 3031,
      usedPortAction: 'kill',
      launchTimeout: 120_000,
    },
    testMatch: ['website/__e2e__/**/*.test.ts'],
    url: 'http://localhost:3031/',
    name: 'docs',
  },

  'storybook-react': {
    environment: 'playwright',
    config: {
      command: dev
        ? 'cd packages/storybook-react && pnpm start -- -p 3032 --ci'
        : 'cd packages/storybook-react && pnpm build && pnpx http-server storybook-static -p 3032',
      port: 3032,
      usedPortAction: 'kill',
      launchTimeout: 120_000,
    },
    testMatch: ['<rootDir>/packages/*/__e2e__/**/*.test.ts'],
    url: 'http://localhost:3032/iframe.html?id=',
    name: 'storybook-react',
  },
};

export const server: TestServer = servers[E2E_SERVER];
