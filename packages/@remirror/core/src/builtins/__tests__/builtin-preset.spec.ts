import { isPresetValid } from '@remirror/testing';

import { BuiltinPreset } from '..';

test('`BuiltinPreset`: is valid', () => {
  expect(isPresetValid(BuiltinPreset)).toBeTrue();
});
