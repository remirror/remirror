import { isPresetValid } from '@remirror/testing';

import { WysiwygPreset } from '..';

test('`WysiwygPreset`: is valid', () => {
  expect(isPresetValid(WysiwygPreset)).toBeTrue();
});
