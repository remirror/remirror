import { isPresetValid } from '@remirror/test-fixtures';

import { EmbedPreset } from '../..';

test('is valid', () => {
  expect(isPresetValid(EmbedPreset, {}));
});
