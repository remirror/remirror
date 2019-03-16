import React from 'react';

import { EditorSchema } from '@remirror/core';
import { InjectedRemirrorProps, Remirror, RemirrorProps } from '@remirror/react';
import { render } from 'react-testing-library';
import { Refs, RefsNode } from './builder';
import { jsdomSelectionPatch } from './jsdom-patch';
import { baseExtensions } from './test-schema';
import { setTextSelection } from './transactions';

export const createTestEditor = (props: Partial<RemirrorProps> = {}) => {
  const extensions = [...baseExtensions, ...(props.extensions ? props.extensions : [])];

  return (content: (schema: EditorSchema) => RefsNode) => {
    let returnedParams!: InjectedRemirrorProps;
    render(
      <Remirror {...props} usesBuiltInExtensions={false} extensions={extensions}>
        {params => {
          returnedParams = params;
          if (props.children) {
            return props.children(params);
          }
          return <div />;
        }}
      </Remirror>,
    );

    const { view } = returnedParams;

    // Work around JSDOM/Node not supporting DOM Selection API
    jsdomSelectionPatch(view);

    let refs: Refs | undefined;

    if (content && view) {
      const { dispatch, state } = view;
      const defaultDoc = content(state.schema);

      // Add the text to the dom
      const tr = state.tr.replaceWith(0, state.doc.nodeSize - 2, defaultDoc.content);

      tr.setMeta('addToHistory', false);
      dispatch(tr);

      refs = defaultDoc.refs;
      if (refs) {
        // Collapsed selection.
        if ('<>' in refs) {
          setTextSelection(view, refs['<>']);
          // Expanded selection
        } else if ('<' in refs || '>' in refs) {
          if ('<' in refs === false) {
            throw new Error('A `<` ref must complement a `>` ref.');
          }
          if ('>' in refs === false) {
            throw new Error('A `>` ref must complement a `<` ref.');
          }
          setTextSelection(view, refs['<'], refs['>']);
        }
      }
    }
    return returnedParams;
  };
};
