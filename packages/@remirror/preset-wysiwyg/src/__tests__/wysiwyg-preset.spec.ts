import { isPresetValid } from '@remirror/testing';

import { WysiwygPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(WysiwygPreset, {}));
});
