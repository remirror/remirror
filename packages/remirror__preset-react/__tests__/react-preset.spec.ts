import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { ReactExtension, ReactPlaceholderExtension } from '../';

extensionValidityTest(ReactExtension);

test('it renders with options', () => {
  const editor = renderEditor(() => [new ReactExtension({ placeholder: 'Hello' })]);
  expect(editor.manager.getExtension(ReactPlaceholderExtension).options.placeholder).toBe('Hello');
});
