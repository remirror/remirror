/**
 * @jest-environment node
 */

import { initialJson, plugins, schema, testDocument } from '@test-fixtures/schema-helpers';
import { EditorState } from 'prosemirror-state';
import { createEditorView, EditorViewSSR } from '../prosemirror-view-ssr';

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
