import { isPresetValid } from '@remirror/test-fixtures';

import { CorePreset } from '../..';

test('is valid', () => {
  expect(isPresetValid(CorePreset, {}));
});
