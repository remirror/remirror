import React from 'react';

import {
  Attrs,
  Cast,
  Extension,
  isMarkExtension,
  isNodeExtension,
  MarkExtension,
  NodeExtension,
  Omit,
} from '@remirror/core';
import { InjectedRemirrorProps, Remirror, RemirrorProps } from '@remirror/react';
import { render } from 'react-testing-library';
import { markFactory, nodeFactory, Refs } from './builder';
import { jsdomSelectionPatch } from './jsdom-patch';
import { BaseExtensionNodeNames, testNodeExtensions } from './test-schema';
import { setTextSelection } from './transactions';
import {
  AddContent,
  CreateTestEditorExtensions,
  CreateTestEditorReturn,
  MarkWithAttrs,
  MarkWithoutAttrs,
  NodeWithAttrs,
  NodeWithoutAttrs,
  TestEditorView,
} from './types';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export const renderEditor = <
  GPlainMarks extends MarkExtension[],
  GPlainNodes extends NodeExtension[],
  GAttrMarks extends MarkExtension[],
  GAttrNodes extends NodeExtension[],
  GOthers extends Extension[],
  GPlainMarkNames extends GPlainMarks[number]['name'],
  GAttrMarkNames extends GAttrMarks[number]['name'],
  GAttrNodeNames extends GAttrNodes[number]['name'],
  GPlainNodeNames extends GPlainNodes[number]['name'] | BaseExtensionNodeNames = BaseExtensionNodeNames,
  GReturn extends CreateTestEditorReturn<
    GPlainMarkNames,
    GPlainNodeNames,
    GAttrMarkNames,
    GAttrNodeNames
  > = CreateTestEditorReturn<GPlainMarkNames, GPlainNodeNames, GAttrMarkNames, GAttrNodeNames>
>(
  {
    plainMarks = Cast<GPlainMarks>([]),
    plainNodes = Cast<GPlainNodes>([]),
    attrMarks = Cast<GAttrMarks>([]),
    attrNodes = Cast<GAttrNodes>([]),
    others = Cast<GOthers>([]),
  }: Partial<CreateTestEditorExtensions<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>>,
  props: Partial<Omit<RemirrorProps, 'extensions'>> = {},
): GReturn => {
  const extensions = [
    ...testNodeExtensions,
    ...others,
    ...plainMarks,
    ...plainNodes,
    ...attrMarks,
    ...attrNodes,
  ];

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

  const view = returnedParams.view as TestEditorView;

  const add: AddContent = content => {
    // Work around JSDOM/Node not supporting DOM Selection API
    jsdomSelectionPatch(view);

    let refs: Refs | undefined;

    if (content && view) {
      const { dispatch, state } = view;
      const defaultDoc = content;

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

    return {
      refs: refs!,
      start: refs ? refs['<>'] : 0,
    };
  };

  const { schema } = view.state;

  const nodesWithAttrs: NodeWithAttrs<GAttrNodeNames> = Cast({});
  attrNodes.filter(isNodeExtension).forEach(({ name }) => {
    nodesWithAttrs[name as GAttrNodeNames] = (attrs: Attrs = {}) => nodeFactory(name, schema, attrs);
  });

  const nodesWithoutAttrs: NodeWithoutAttrs<GPlainNodeNames> = Cast({});
  [...plainNodes, ...testNodeExtensions].filter(isNodeExtension).forEach(({ name }) => {
    nodesWithoutAttrs[name as GPlainNodeNames] = nodeFactory(name, schema);
  });

  const marksWithAttrs: MarkWithAttrs<GAttrMarkNames> = Cast({});
  attrMarks.filter(isMarkExtension).forEach(({ name }) => {
    marksWithAttrs[name as GAttrMarkNames] = (attrs: Attrs = {}) => markFactory(name, schema, attrs);
  });

  const marksWithoutAttrs: MarkWithoutAttrs<GPlainMarkNames> = Cast({});
  plainMarks.filter(isMarkExtension).forEach(({ name }) => {
    marksWithoutAttrs[name as GPlainMarkNames] = markFactory(name, schema);
  });

  return Cast<GReturn>({
    ...returnedParams,
    view,
    schema,
    state: view.state,
    add,
    nodes: nodesWithoutAttrs,
    marks: marksWithoutAttrs,
    attrNodes: nodesWithAttrs,
    attrMarks: marksWithAttrs,
  });
};
