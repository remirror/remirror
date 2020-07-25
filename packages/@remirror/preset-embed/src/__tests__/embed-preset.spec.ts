import { isPresetValid } from '@remirror/testing';

import { EmbedPreset } from '../..';

test('`EmbedPreset`: is valid', () => {
  expect(isPresetValid(EmbedPreset)).toBeTrue();
});
