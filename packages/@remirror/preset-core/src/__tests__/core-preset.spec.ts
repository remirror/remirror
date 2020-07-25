import { isPresetValid } from '@remirror/testing';

import { CorePreset } from '../..';

test('`CorePreset`: is valid', () => {
  expect(isPresetValid(CorePreset)).toBeTrue();
});
