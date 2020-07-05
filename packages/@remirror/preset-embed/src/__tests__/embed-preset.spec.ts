import { isPresetValid } from '@remirror/testing';

import { EmbedPreset } from '../..';

test('is valid', () => {
  expect(isPresetValid(EmbedPreset, {}));
});
