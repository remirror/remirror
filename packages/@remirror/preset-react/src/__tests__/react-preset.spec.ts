import { isPresetValid } from '@remirror/testing';

import { ReactPreset } from '..';

test('is react preset valid', () => {
  expect(isPresetValid(ReactPreset, {}));
});
