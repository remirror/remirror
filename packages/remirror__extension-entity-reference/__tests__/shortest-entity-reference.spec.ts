import { getShortestEntityReference } from '../src/utils/shortest-entity-reference';

describe('getShortestEntityReference', () => {
  it('detects shortest highlight', () => {
    const shortest = { text: 'short' };
    const mark2 = { text: 'longer' };
    const mark3 = { text: 'very long' };

    expect(getShortestEntityReference([shortest, mark2, mark3])).toEqual(shortest);
  });
});
