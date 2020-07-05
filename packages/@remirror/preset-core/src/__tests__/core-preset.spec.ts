import { isPresetValid } from '@remirror/testing';

import { CorePreset } from '../..';

test('is valid', () => {
  expect(isPresetValid(CorePreset, {}));
});
