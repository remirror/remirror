import { isPresetValid } from '@remirror/test-fixtures';

import { ListPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(ListPreset, {}));
});
