import React from 'react';

import {
  Attrs,
  Cast,
  Extension,
  ExtensionManager,
  isMarkExtension,
  isNodeExtension,
  MarkExtension,
  NodeExtension,
  Omit,
} from '@remirror/core';
import { InjectedRemirrorProps, Remirror, RemirrorProps } from '@remirror/react';
import { AllSelection } from 'prosemirror-state';
import { render } from 'react-testing-library';
import { markFactory, nodeFactory } from './builder';
import { jsdomSelectionPatch } from './jsdom-patch';
import { BaseExtensionNodeNames, nodeExtensions } from './test-schema';
import { dispatchNodeSelection, dispatchTextSelection, insertText, replaceSelection } from './transactions';
import {
  AddContent,
  AddContentReturn,
  CreateTestEditorExtensions,
  CreateTestEditorReturn,
  MarkWithAttrs,
  MarkWithoutAttrs,
  NodeWithAttrs,
  NodeWithoutAttrs,
  Tags,
  TestEditorView,
} from './types';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export const renderEditor = <
  GPlainMarks extends Array<MarkExtension<any>>,
  GPlainNodes extends Array<NodeExtension<any>>,
  GAttrMarks extends Array<MarkExtension<any>>,
  GAttrNodes extends Array<NodeExtension<any>>,
  GOthers extends Array<Extension<any>>,
  GPlainMarkNames extends GPlainMarks[number]['name'],
  GAttrMarkNames extends GAttrMarks[number]['name'],
  GAttrNodeNames extends GAttrNodes[number]['name'],
  GPlainNodeNames extends GPlainNodes[number]['name'] | BaseExtensionNodeNames,
  GReturn extends CreateTestEditorReturn<
    GPlainMarkNames,
    GPlainNodeNames,
    GAttrMarkNames,
    GAttrNodeNames
  > = CreateTestEditorReturn<
    GPlainMarkNames,
    GPlainNodeNames | BaseExtensionNodeNames,
    GAttrMarkNames,
    GAttrNodeNames
  >
>(
  {
    plainMarks = Cast<GPlainMarks>([]),
    plainNodes = Cast<GPlainNodes>([]),
    attrMarks = Cast<GAttrMarks>([]),
    attrNodes = Cast<GAttrNodes>([]),
    others = Cast<GOthers>([]),
  }: Partial<CreateTestEditorExtensions<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>> = {},
  props: Partial<Omit<RemirrorProps, 'manager'>> = {},
): GReturn => {
  const extensions = [
    ...nodeExtensions,
    ...others,
    ...plainMarks,
    ...plainNodes,
    ...attrMarks,
    ...attrNodes,
  ].map(extension => ({ extension, priority: 2 }));
  const manager = ExtensionManager.create(extensions);
  let returnedParams!: InjectedRemirrorProps;
  const utils = render(
    <Remirror {...props} manager={manager}>
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

  const add: AddContent = taggedDoc => {
    // Work around JSDOM/Node not supporting DOM Selection API
    jsdomSelectionPatch(view);

    const { content } = taggedDoc;
    const { cursor, node, start, end, all, ...tags } = taggedDoc.tags || ({} as Tags);
    const { dispatch, state } = view;

    // Add the text to the dom
    const tr = state.tr.replaceWith(0, state.doc.nodeSize - 2, content);

    tr.setMeta('addToHistory', false);
    dispatch(tr);

    if (all) {
      view.dispatch(view.state.tr.setSelection(new AllSelection(taggedDoc)));
    } else if (node) {
      dispatchNodeSelection({ view, pos: node });
    } else if (cursor) {
      dispatchTextSelection({ view, start: cursor });
    } else if (start) {
      dispatchTextSelection({
        view,
        start,
        end: end && start <= end ? end : taggedDoc.resolve(start).end(),
      });
    }

    const createAddContentReturn = (newTags?: Tags): AddContentReturn => {
      const { from, to } = view.state.selection;
      return {
        tags: newTags ? { ...tags, ...newTags } : tags,
        start: from,
        end: to,
        replace: (...replacement) => {
          return createAddContentReturn(replaceSelection({ view, content: replacement }));
        },
        insertText: text => {
          insertText({ start: from, text, view });
          return createAddContentReturn();
        },
        overwrite: add,
      };
    };

    return createAddContentReturn();
  };

  const { schema } = view.state;

  const nodesWithAttrs: NodeWithAttrs<GAttrNodeNames> = Cast({});
  attrNodes.filter(isNodeExtension).forEach(({ name }) => {
    nodesWithAttrs[name as GAttrNodeNames] = (attrs: Attrs = {}) => nodeFactory({ name, schema, attrs });
  });

  const nodesWithoutAttrs: NodeWithoutAttrs<GPlainNodeNames> = Cast({});
  [...plainNodes, ...nodeExtensions].filter(isNodeExtension).forEach(({ name }) => {
    nodesWithoutAttrs[name as GPlainNodeNames] = nodeFactory({ name, schema });
  });

  const marksWithAttrs: MarkWithAttrs<GAttrMarkNames> = Cast({});
  attrMarks.filter(isMarkExtension).forEach(({ name }) => {
    marksWithAttrs[name as GAttrMarkNames] = (attrs: Attrs = {}) => markFactory({ name, schema, attrs });
  });

  const marksWithoutAttrs: MarkWithoutAttrs<GPlainMarkNames> = Cast({});
  plainMarks.filter(isMarkExtension).forEach(({ name }) => {
    marksWithoutAttrs[name as GPlainMarkNames] = markFactory({ name, schema });
  });

  return Cast<GReturn>({
    ...returnedParams,
    utils,
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
