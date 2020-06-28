import { isPresetValid } from '@remirror/test-fixtures';

import { WysiwygPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(WysiwygPreset, {}));
});
