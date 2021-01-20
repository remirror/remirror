import { renderEditor } from 'jest-remirror';
import { BoldExtension } from '@remirror/extension-bold';

import { wysiwygPreset } from '../';

test('it renders with options', () => {
  const editor = renderEditor(() => wysiwygPreset({ weight: 900 }));
  expect(editor.manager.getExtension(BoldExtension).options.weight).toBe(900);
});
