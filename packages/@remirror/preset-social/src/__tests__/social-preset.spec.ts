import { isPresetValid } from '@remirror/testing';

import { SocialPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(SocialPreset, { matchers: [] }));
});
