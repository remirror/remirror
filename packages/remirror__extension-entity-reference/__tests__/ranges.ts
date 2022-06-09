import 'jest-remirror';

import { findMinMaxRange } from '../src/utils/ranges';

describe('findMinMaxRange', () => {
  it('finds edges of marks', () => {
    const mark1 = { from: 1, to: 5 };
    const mark2 = { from: 4, to: 15 };
    const mark3 = { from: 7, to: 10 };

    const [min, max] = findMinMaxRange([mark1, mark2, mark3]);

    expect(min).toBe(1);
    expect(max).toBe(15);
  });
});
