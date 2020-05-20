import { isPresetValid } from '@remirror/test-fixtures';

import { BuiltinPreset } from '..';

test('is builtin preset valid', () => {
  expect(isPresetValid(BuiltinPreset, {}));
});
