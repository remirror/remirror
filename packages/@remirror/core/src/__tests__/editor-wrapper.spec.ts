import { renderEditor } from 'jest-remirror';

test('autoFocus', () => {
  const defaultEditor = renderEditor([], { props: {} });
  expect(defaultEditor.dom.getAttribute('autofocus')).toBeFalsy();

  const unfocusedEditor = renderEditor([], { props: { autoFocus: false } });
  expect(unfocusedEditor.dom.getAttribute('autofocus')).toBeFalsy();

  const focusedEditor = renderEditor([], { props: { autoFocus: true } });
  expect(focusedEditor.dom.getAttribute('autofocus')).toBeTruthy();

  const focusedPosition = renderEditor([], { props: { autoFocus: 0 } });
  expect(focusedPosition.dom.getAttribute('autofocus')).toBeTruthy();
});
