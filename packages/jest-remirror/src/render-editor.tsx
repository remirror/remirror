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
} from '@remirror/core';
import { InjectedRemirrorProps, Remirror, RemirrorProps } from '@remirror/react';
import { render } from '@testing-library/react/pure';
import { TestEditorView } from 'jest-prosemirror';
import { markFactory, nodeFactory } from './builder';
import {
  AddContent,
  AddContentReturn,
  CreateTestEditorExtensions,
  CreateTestEditorReturn,
  GenericExtension,
  GetNames,
  MarkWithAttrs,
  MarkWithoutAttrs,
  NodeWithAttrs,
  NodeWithoutAttrs,
  Tags,
} from './jest-remirror-types';
import { jsdomSelectionPatch } from './jsdom-patch';
import { BaseExtensionNodeNames, nodeExtensions } from './test-schema';
import {
  dispatchAllSelection,
  dispatchNodeSelection,
  dispatchTextSelection,
  fireEventAtPosition,
  insertText,
  press,
  replaceSelection,
  shortcut,
} from './transactions';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export const renderEditor = <
  GPlainMarks extends Array<MarkExtension<any>>,
  GPlainNodes extends Array<NodeExtension<any>>,
  GAttrMarks extends Array<MarkExtension<any>>,
  GAttrNodes extends Array<NodeExtension<any>>,
  GOthers extends Array<Extension<any>>,
  GReturn extends CreateTestEditorReturn<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>,
  GExtension extends GenericExtension<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>,
  GPlainMarkNames extends GetNames<GPlainMarks>,
  GAttrMarkNames extends GetNames<GAttrMarks>,
  GAttrNodeNames extends GetNames<GAttrNodes>,
  GPlainNodeNames extends GetNames<GPlainNodes> | BaseExtensionNodeNames
>(
  {
    plainMarks = Cast<GPlainMarks>([]),
    plainNodes = Cast<GPlainNodes>([]),
    attrMarks = Cast<GAttrMarks>([]),
    attrNodes = Cast<GAttrNodes>([]),
    others = Cast<GOthers>([]),
  }: Partial<CreateTestEditorExtensions<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>> = {},
  props: Partial<Omit<RemirrorProps<GExtension>, 'manager'>> = {},
): GReturn => {
  const innerNodeExtensions = nodeExtensions.filter(({ name }) => !plainNodes.some(ext => ext.name === name));
  const extensions = [
    ...innerNodeExtensions,
    ...others,
    ...plainMarks,
    ...plainNodes,
    ...attrMarks,
    ...attrNodes,
  ].map(extension => ({ extension, priority: 2 }));
  const manager = ExtensionManager.create(extensions);
  let returnedParams!: InjectedRemirrorProps<GExtension>;

  const utils = render(
    <Remirror {...(props as any)} manager={manager as any}>
      {params => {
        returnedParams = params as any;

        if (props.children) {
          return props.children(params as any);
        }

        return <div />;
      }}
    </Remirror>,
  );

  const view = returnedParams.view as TestEditorView;

  const add: AddContent<GExtension> = taggedDoc => {
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
      dispatchAllSelection({ view });
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

    const updateContent = (newTags?: Tags): AddContentReturn<GExtension> => {
      const { selection, doc } = view.state;
      return {
        tags: newTags ? { ...tags, ...newTags } : tags,
        start: selection.from,
        end: selection.to,

        overwrite: add,
        state: view.state,
        actions: returnedParams.actions,
        helpers: returnedParams.helpers,
        jumpTo: (pos: 'start' | 'end' | number, endPos?: number) => {
          if (pos === 'start') {
            dispatchTextSelection({ view, start: 1 });
          } else if (pos === 'end') {
            dispatchTextSelection({ view, start: doc.content.size - 1 });
          } else {
            dispatchTextSelection({ view, start: pos, end: endPos });
          }
          return updateContent();
        },
        replace: (...replacement) => {
          return updateContent(replaceSelection({ view, content: replacement }));
        },
        insertText: text => {
          const { from } = view.state.selection;
          insertText({ start: from, text, view });
          return updateContent();
        },
        actionsCallback: callback => {
          callback(returnedParams.actions);
          return updateContent();
        },
        helpersCallback: callback => {
          callback(returnedParams.helpers);
          return updateContent(); // Helpers don't update the content but this is easier.
        },
        shortcut: text => {
          shortcut({ shortcut: text, view });
          return updateContent();
        },
        press: char => {
          press({ char, view });
          return updateContent();
        },
        dispatchCommand: command => {
          command(view.state, view.dispatch, view);
          return updateContent();
        },
        fire: params => {
          fireEventAtPosition({ view, ...params });
          return updateContent();
        },
      };
    };

    return updateContent();
  };

  const { schema } = view.state;

  const nodesWithAttrs: NodeWithAttrs<GAttrNodeNames> = Cast({});
  attrNodes.filter(isNodeExtension).forEach(({ name }) => {
    nodesWithAttrs[name as GAttrNodeNames] = (attrs: Attrs = {}) => nodeFactory({ name, schema, attrs });
  });

  const nodesWithoutAttrs: NodeWithoutAttrs<GPlainNodeNames> = Cast({
    p: nodeFactory({ name: 'paragraph', schema }),
  });
  [...plainNodes, ...innerNodeExtensions].filter(isNodeExtension).forEach(({ name }) => {
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
    getState: returnedParams.manager.getState,
    add,
    nodes: nodesWithoutAttrs,
    marks: marksWithoutAttrs,
    attrNodes: nodesWithAttrs,
    attrMarks: marksWithAttrs,
  });
};
