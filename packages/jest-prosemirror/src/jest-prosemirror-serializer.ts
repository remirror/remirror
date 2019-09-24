import { isProsemirrorNode, isEditorState, isEditorSchema, keys } from '@remirror/core';

/**
 * Jest serializer for prosemirror nodes and the editor state.
 */
export const prosemirrorSerializer: jest.SnapshotSerializerPlugin = {
  test: val => isProsemirrorNode(val) || isEditorState(val) || isEditorSchema(val),
  print: val => {
    if (isEditorState(val)) {
      return `Prosemirror doc: ${JSON.stringify(
        val.doc.toJSON(),
        null,
        2,
      )}\nProsemirror selection: ${JSON.stringify(val.selection, null, 2)}`;
    }

    if (isEditorSchema(val)) {
      const nodes = keys(val.nodes).reduce((acc, key) => {
        const { spec } = val.nodes[key];
        return { ...acc, [key]: spec };
      }, {});
      const marks = keys(val.marks).reduce((acc, key) => {
        const { spec } = val.marks[key];
        return { ...acc, [key]: spec };
      }, {});

      return `Prosemirror schema: ${JSON.stringify(
        {
          nodes,
          marks,
        },
        null,
        2,
      )}`;
    }

    return `Prosemirror node: ${JSON.stringify(val, null, 2)}`;
  },
};
