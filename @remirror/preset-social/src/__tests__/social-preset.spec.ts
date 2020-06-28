import { isPresetValid } from '@remirror/test-fixtures';

import { SocialPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(SocialPreset, { matchers: [] }));
});
