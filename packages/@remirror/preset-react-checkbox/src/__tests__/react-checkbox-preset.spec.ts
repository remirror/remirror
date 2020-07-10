import { isPresetValid } from '@remirror/testing';

import { CheckboxPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(CheckboxPreset, {}));
});
