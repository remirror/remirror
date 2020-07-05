import { isPresetValid } from '@remirror/testing';

import { BuiltinPreset } from '..';

test('is builtin preset valid', () => {
  expect(isPresetValid(BuiltinPreset, {}));
});
