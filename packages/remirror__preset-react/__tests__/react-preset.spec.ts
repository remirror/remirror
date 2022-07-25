import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { PlaceholderExtension } from '@remirror/extension-placeholder';

import { ReactExtension } from '../';

extensionValidityTest(ReactExtension);

test('it renders with options', () => {
  const editor = renderEditor(() => [new ReactExtension({ placeholder: 'Hello' })]);
  expect(editor.manager.getExtension(PlaceholderExtension).options.placeholder).toBe('Hello');
});
