import { isPresetValid } from '@remirror/testing';

import { ListPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(ListPreset, {}));
});
