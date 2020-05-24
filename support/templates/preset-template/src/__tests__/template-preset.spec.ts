import { isPresetValid } from '@remirror/test-fixtures';

import { TemplatePreset } from '../..';

test('is valid', () => {
  expect(isPresetValid(TemplatePreset, {}));
});
