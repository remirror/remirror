import { isPresetValid } from '@remirror/testing';

import { CheckboxPreset } from '..';

test('`CheckboxPreset`: is valid', () => {
  expect(isPresetValid(CheckboxPreset)).toBeTrue();
});
