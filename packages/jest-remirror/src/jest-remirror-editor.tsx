import { render } from '@testing-library/react/pure';
import {
  dispatchAllSelection,
  dispatchNodeSelection,
  dispatchTextSelection,
  fireEventAtPosition,
  insertText,
  pasteContent,
  press,
  shortcut,
  TestEditorView,
} from 'jest-prosemirror';
import React from 'react';

import {
  Attributes,
  Cast,
  convertToPrioritizedExtension,
  Extension,
  FlexibleExtension,
  isMarkExtension,
  isNodeExtension,
  Manager,
  MarkExtension,
  NodeExtension,
  object,
  pick,
} from '@remirror/core';
import { InjectedRemirrorProps, RemirrorProps, RenderEditor } from '@remirror/react';

import { markFactory, nodeFactory } from './jest-remirror-builder';
import { BaseExtensionNodeNames, nodeExtensions } from './jest-remirror-schema';
import {
  AddContent,
  AddContentReturn,
  CreateTestEditorExtensions,
  CreateTestEditorReturn,
  GenericExtension,
  GetNames,
  MarkWithAttributes,
  MarkWithoutAttributes,
  NodeWithAttributes,
  NodeWithoutAttributes,
  Tags,
} from './jest-remirror-types';
import { replaceSelection } from './jest-remirror-utils';
import { jsdomSelectionPatch } from './jsdom-patch';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export const renderEditor = <
  GPlainMarks extends Array<FlexibleExtension<MarkExtension<any>>>,
  GPlainNodes extends Array<FlexibleExtension<NodeExtension<any>>>,
  GAttrMarks extends Array<FlexibleExtension<MarkExtension<any>>>,
  GAttrNodes extends Array<FlexibleExtension<NodeExtension<any>>>,
  GOthers extends Array<FlexibleExtension<Extension<any>>>,
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
    attrMarks: attributeMarks = Cast<GAttrMarks>([]),
    attrNodes: attributeNodes = Cast<GAttrNodes>([]),
    others = Cast<GOthers>([]),
  }: Partial<
    CreateTestEditorExtensions<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>
  > = object(),
  properties: Partial<Omit<RemirrorProps<GExtension>, 'manager'>> = object(),
): GReturn => {
  const innerNodeExtensions = nodeExtensions.filter(
    ({ name }) =>
      !plainNodes.some(
        (extension) => convertToPrioritizedExtension(extension).extension.name === name,
      ),
  );

  const extensions = [
    ...innerNodeExtensions,
    ...others,
    ...plainMarks,
    ...plainNodes,
    ...attributeMarks,
    ...attributeNodes,
  ].map(convertToPrioritizedExtension);
  const manager = Manager.create(extensions);
  let returnedParameters: InjectedRemirrorProps<GExtension>;

  const utils = render(
    <RenderEditor {...(properties as any)} manager={manager as any}>
      {(parameters) => {
        returnedParameters = parameters;

        if (properties.children) {
          return properties.children(parameters);
        }

        return <div />;
      }}
    </RenderEditor>,
  );

  const view = returnedParameters.view as TestEditorView;

  const add: AddContent<GExtension> = (taggedDocument) => {
    // Work around JSDOM/Node not supporting DOM Selection API
    jsdomSelectionPatch(view);

    const { content } = taggedDocument;
    const { cursor, node, start, end, all, ...tags } = taggedDocument.tags;
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
        end: end && start <= end ? end : taggedDocument.resolve(start).end(),
      });
    }

    const updateContent = (newTags?: Tags): AddContentReturn<GExtension> => {
      const { selection, doc } = view.state;
      const returnValue: AddContentReturn<GExtension> = {
        tags: newTags ? { ...tags, ...newTags } : tags,
        start: selection.from,
        end: selection.to,
        doc,
        overwrite: add,
        state: view.state,
        view,
        actions: returnedParameters.actions,
        helpers: returnedParameters.helpers,
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
        insertText: (text) => {
          const { from } = view.state.selection;
          insertText({ start: from, text, view });
          return updateContent();
        },
        callback: (fn) => {
          fn(
            pick(returnValue, [
              'helpers',
              'actions',
              'end',
              'state',
              'tags',
              'start',
              'doc',
              'view',
            ]),
          );
          return updateContent();
        },
        actionsCallback: (callback) => {
          callback(returnedParameters.actions);
          return updateContent();
        },
        helpersCallback: (callback) => {
          callback(returnedParameters.helpers);
          return updateContent(); // Helpers don't update the content but this is easier.
        },
        shortcut: (text) => {
          shortcut({ shortcut: text, view });
          return updateContent();
        },
        paste: (content) => {
          pasteContent({ view, content });
          return updateContent();
        },
        press: (char) => {
          press({ char, view });
          return updateContent();
        },
        dispatchCommand: (command) => {
          command(view.state, view.dispatch, view);
          return updateContent();
        },
        fire: (parameters) => {
          fireEventAtPosition({ view, ...parameters });
          return updateContent();
        },
      };

      return returnValue;
    };

    return updateContent();
  };

  const { schema } = view.state;

  const nodesWithAttributes: NodeWithAttributes<GAttrNodeNames> = object();
  attributeNodes.filter(isNodeExtension).forEach(({ name }) => {
    nodesWithAttributes[name as GAttrNodeNames] = (attributes: Attributes = object()) =>
      nodeFactory({ name, schema, attributes: attributes });
  });

  const nodesWithoutAttributes: NodeWithoutAttributes<GPlainNodeNames> = Cast({
    p: nodeFactory({ name: 'paragraph', schema }),
  });
  [...plainNodes, ...innerNodeExtensions].filter(isNodeExtension).forEach(({ name }) => {
    nodesWithoutAttributes[name as GPlainNodeNames] = nodeFactory({ name, schema });
  });

  const marksWithAttributes: MarkWithAttributes<GAttrMarkNames> = object();
  attributeMarks.filter(isMarkExtension).forEach(({ name }) => {
    marksWithAttributes[name as GAttrMarkNames] = (attributes: Attributes = object()) =>
      markFactory({ name, schema, attributes: attributes });
  });

  const marksWithoutAttributes: MarkWithoutAttributes<GPlainMarkNames> = object();
  plainMarks.filter(isMarkExtension).forEach(({ name }) => {
    marksWithoutAttributes[name as GPlainMarkNames] = markFactory({ name, schema });
  });

  return ({
    ...returnedParameters,
    utils,
    view,
    schema,
    getState: returnedParameters.manager.getState,
    add,
    nodes: nodesWithoutAttributes,
    marks: marksWithoutAttributes,
    attrNodes: nodesWithAttributes,
    attrMarks: marksWithAttributes,
    p: (nodesWithoutAttributes as any).p,
    doc: (nodesWithoutAttributes as any).doc,
  } as unknown) as GReturn;
};
