import { renderEditor } from 'jest-remirror';

test('autoFocus', () => {
  const defaultEditor = renderEditor<never>([], { props: {} });
  expect(defaultEditor.dom.getAttribute('autofocus')).toBeNull();

  const unfocusedEditor = renderEditor<never>([], { props: { autoFocus: false } });
  expect(unfocusedEditor.dom.getAttribute('autofocus')).toBeNull();

  const focusedEditor = renderEditor<never>([], { props: { autoFocus: true } });
  expect(focusedEditor.dom.getAttribute('autofocus')).toBe('true');

  const focusedPosition = renderEditor<never>([], { props: { autoFocus: 0 } });
  expect(focusedPosition.dom.getAttribute('autofocus')).toBe('true');
});
