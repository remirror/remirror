import { renderEditor } from 'jest-remirror';

test('autoFocus', () => {
  const defaultEditor = renderEditor([], { props: {} });
  expect(defaultEditor.dom.getAttribute('autofocus')).toBeNull();

  const unfocusedEditor = renderEditor([], { props: { autoFocus: false } });
  expect(unfocusedEditor.dom.getAttribute('autofocus')).toBeNull();

  const focusedEditor = renderEditor([], { props: { autoFocus: true } });
  expect(focusedEditor.dom.getAttribute('autofocus')).toBe('true');

  const focusedPosition = renderEditor([], { props: { autoFocus: 0 } });
  expect(focusedPosition.dom.getAttribute('autofocus')).toBe('true');
});
