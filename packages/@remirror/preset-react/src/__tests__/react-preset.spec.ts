import { isPresetValid } from '@remirror/testing';

import { ReactPreset } from '..';

test('`ReactPreset`: is valid', () => {
  expect(isPresetValid(ReactPreset)).toBeTrue();
});
