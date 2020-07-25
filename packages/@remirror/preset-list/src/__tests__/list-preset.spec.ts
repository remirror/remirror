import { isPresetValid } from '@remirror/testing';

import { ListPreset } from '..';

test('`ListPreset`: is valid', () => {
  expect(isPresetValid(ListPreset)).toBeTrue();
});
