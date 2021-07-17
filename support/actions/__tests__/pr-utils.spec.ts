import nock from 'nock';

import { getBuildNumber } from '../src/pr-utils';

describe('getBuildNumber', () => {
  it('returns 1 when no version exists', async () => {
    const tag = 'pr706';
    nock('https://data.jsdelivr.com')
      .get(`/v1/package/resolve/npm/remirror@${tag}`)
      .reply(200, JSON.stringify({ version: null }));
    await expect(getBuildNumber(tag)).resolves.toBe(1);
  });

  it('returns 1 for invalid number', async () => {
    const tag = 'pr706';
    nock('https://data.jsdelivr.com')
      .get(`/v1/package/resolve/npm/remirror@${tag}`)
      .reply(200, JSON.stringify({ version: '1.0.0-pr706.asd' }));
    await expect(getBuildNumber(tag)).resolves.toBe(1);
  });

  it('returns valid number', async () => {
    const tag = 'pr706';
    nock('https://data.jsdelivr.com')
      .get(`/v1/package/resolve/npm/remirror@${tag}`)
      .reply(200, JSON.stringify({ version: '1.0.0-pr706.100' }));
    await expect(getBuildNumber(tag)).resolves.toBe(101);
  });
});
