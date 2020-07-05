import { isPresetValid } from '@remirror/testing';

import { TemplatePreset } from '..';

test('is valid', () => {
  expect(isPresetValid(TemplatePreset, {}));
});
