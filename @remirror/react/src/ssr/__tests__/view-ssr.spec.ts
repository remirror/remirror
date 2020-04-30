/**
 * @jest-environment node
 */

import { EditorState } from 'prosemirror-state';

import { initialJson, plugins, schema, testDocument } from '@remirror/test-fixtures';

import { createEditorView, EditorViewSSR } from '../ssr-prosemirror-view';

const state = EditorState.create({ doc: schema.nodeFromJSON(initialJson), schema, plugins });

test('createEditorView', () => {
  const view = createEditorView(
    { mount: testDocument.createElement('div') },
    {
      state,
      editable: () => {
        return true;
      },
    },
  );

  expect(view).toBeInstanceOf(EditorViewSSR);
  expect(view.destroy).toBeFunction();
  expect(view.state).toBe(state);
});

test('createEditorView:forceEnvironment', () => {
  expect(() =>
    createEditorView(
      { mount: testDocument.createElement('div') },
      {
        state,
        editable: () => {
          return true;
        },
      },
      'dom',
    ),
  ).toThrowErrorMatchingInlineSnapshot(`"Cannot read property 'add' of undefined"`);
});
