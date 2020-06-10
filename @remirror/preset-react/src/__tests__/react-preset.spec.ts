import { isPresetValid } from '@remirror/test-fixtures';

import { ReactPreset } from '../../dist/preset-react.cjs';

test('is react preset valid', () => {
  expect(isPresetValid(ReactPreset, {}));
});
