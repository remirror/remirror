import {
  Attrs,
  EditorSchema,
  EditorState,
  EditorView,
  Extension,
  MarkExtension,
  NodeExtension,
  Omit,
} from '@remirror/core';
import { InjectedRemirrorProps } from '@remirror/react';
import { markFactory, nodeFactory, Refs, RefsNode } from './builder';

export type AddContent = (
  content: RefsNode,
) => {
  start: number;
  refs: Refs;
};
export type MarkWithAttrs<GNames extends string> = {
  [P in GNames]: (attrs?: Attrs) => ReturnType<typeof markFactory>
};
export type NodeWithAttrs<GNames extends string> = {
  [P in GNames]: (attrs?: Attrs) => ReturnType<typeof nodeFactory>
};
export type MarkWithoutAttrs<GNames extends string> = { [P in GNames]: ReturnType<typeof markFactory> };
export type NodeWithoutAttrs<GNames extends string> = { [P in GNames]: ReturnType<typeof nodeFactory> };
export type CreateTestEditorReturn<
  GPlainMarkNames extends string,
  GPlainNodeNames extends string,
  GAttrMarkNames extends string,
  GAttrNodeNames extends string
> = Omit<InjectedRemirrorProps, 'view'> & {
  view: TestEditorView;
} & {
  add: AddContent;
  nodes: NodeWithoutAttrs<GPlainNodeNames>;
  marks: MarkWithoutAttrs<GPlainMarkNames>;
  attrNodes: NodeWithAttrs<GAttrNodeNames>;
  attrMarks: MarkWithAttrs<GAttrMarkNames>;
  state: EditorState;
  schema: EditorSchema;
};

export interface CreateTestEditorExtensions<
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

export interface TestEditorView extends EditorView {
  dispatchEvent(event: string | CustomEvent | { type: string }): void;
}
