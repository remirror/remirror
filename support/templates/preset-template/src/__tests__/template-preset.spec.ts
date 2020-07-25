import { isPresetValid } from '@remirror/testing';

import { TemplatePreset } from '..';

test('`TemplatePreset`: is valid', () => {
  expect(isPresetValid(TemplatePreset)).toBeTrue();
});
