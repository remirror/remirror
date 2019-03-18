import React from 'react';

import {
  Attrs,
  Cast,
  EditorSchema,
  EditorState,
  Extension,
  MarkExtension,
  NodeExtension,
  Omit,
} from '@remirror/core';
import { isMarkExtension, isNodeExtension } from '@remirror/core/src/extension-manager.helpers';
import { InjectedRemirrorProps, Remirror, RemirrorProps } from '@remirror/react';
import { render } from 'react-testing-library';
import { markFactory, nodeFactory, Refs, RefsNode } from './builder';
import { jsdomSelectionPatch } from './jsdom-patch';
import { testNodeExtensions } from './test-schema';
import { setTextSelection } from './transactions';

type BaseExtensionNodeNames = (typeof testNodeExtensions)[number]['name'];

type AddContent = (content: RefsNode) => { start: number; refs: Refs };
type MarkWithAttrs<GNames extends string> = {
  [P in GNames]: (attrs?: Attrs) => ReturnType<typeof markFactory>
};
type NodeWithAttrs<GNames extends string> = {
  [P in GNames]: (attrs?: Attrs) => ReturnType<typeof nodeFactory>
};
type MarkWithoutAttrs<GNames extends string> = { [P in GNames]: ReturnType<typeof markFactory> };
type NodeWithoutAttrs<GNames extends string> = { [P in GNames]: ReturnType<typeof nodeFactory> };

type CreateTestEditorReturn<
  GPlainMarkNames extends string,
  GPlainNodeNames extends string,
  GAttrMarkNames extends string,
  GAttrNodeNames extends string
> = InjectedRemirrorProps & {
  add: AddContent;
  nodes: NodeWithoutAttrs<GPlainNodeNames>;
  marks: MarkWithoutAttrs<GPlainMarkNames>;
  attrNodes: NodeWithAttrs<GAttrNodeNames>;
  attrMarks: MarkWithAttrs<GAttrMarkNames>;
  state: EditorState;
  schema: EditorSchema;
};

/**
 * Plain items don't accept attributes as their first paramter
 */
interface CreateTestEditorExtensions<
  GPlainMarks extends MarkExtension[],
  GPlainNodes extends NodeExtension[],
  GAttrMarks extends MarkExtension[],
  GAttrNodes extends NodeExtension[],
  GOthers extends Extension[]
> {
  plainMarks: GPlainMarks;
  plainNodes: GPlainNodes;
  attrMarks: GAttrMarks;
  attrNodes: GAttrNodes;
  others: GOthers;
}

export const createTestEditor = <
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
  // GReturn extends InjectedRemirrorProps & {
  //   add: AddContent;
  //   nodes: NodeWithoutAttrs<GPlainNodeNames>;
  //   marks: MarkWithoutAttrs<GPlainMarkNames>;
  //   attrNodes: NodeWithAttrs<GAttrNodeNames>;
  //   attrMarks: MarkWithAttrs<GAttrMarkNames>;
  // }
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

  const { view } = returnedParams;

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
    schema,
    state: view.state,
    add,
    nodes: nodesWithoutAttrs,
    marks: marksWithoutAttrs,
    attrNodes: nodesWithAttrs,
    attrMarks: marksWithAttrs,
  });
};
