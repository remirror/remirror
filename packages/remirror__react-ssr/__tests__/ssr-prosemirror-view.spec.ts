/**
 * @jest-environment node
 */

import { createCoreManager } from 'remirror/extensions';
import { createFramework, minDocument } from 'testing';
import { EMPTY_PARAGRAPH_NODE } from '@remirror/core';
import { EditorState } from '@remirror/pm/state';

import { createEditorView } from '../';

const manager = createCoreManager([]);
manager.attachFramework(createFramework(manager), () => {});

const { schema, plugins } = manager.store;
const state = EditorState.create({
  doc: schema.nodeFromJSON(EMPTY_PARAGRAPH_NODE),
  schema,
  plugins,
});

test('createEditorView', () => {
  const view = createEditorView(minDocument.createElement('div'), {
    state,
    editable: () => {
      return true;
    },
    plugins: [],
  });

  expect(view.destroy).toBeFunction();
  expect(view.state).toBe(state);
});

test('createEditorView:forceEnvironment', () => {
  expect(() =>
    createEditorView(
      minDocument.createElement('div'),
      {
        state,
        editable: () => {
          return true;
        },
        plugins: [],
      },
      'dom',
    ),
  ).toThrow();
});
