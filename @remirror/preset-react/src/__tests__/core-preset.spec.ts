import { isPresetValid } from '@remirror/test-fixtures';

import { ReactPreset } from '../..';

test('is react preset valid', () => {
  expect(isPresetValid(ReactPreset, {}));
});
