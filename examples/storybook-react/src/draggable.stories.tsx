import './draggable.css';

import { Story } from '@storybook/react';
import { Dispatch, useCallback } from 'react';
import {
  ApplySchemaAttributes,
  convertCommand,
  CreateExtensionPlugin,
  DispatchFunction,
  EditorSchema,
  EditorState,
  ExtensionPriority,
  ExtensionTag,
  KeymapExtension,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeWithPosition,
  PlainExtension,
} from 'remirror';
import {
  BlockquoteExtension,
  BulletListExtension,
  DocExtension,
  DropCursorExtension,
  GetActiveProps,
  GetPositionProps,
  hasStateChanged,
  ListItemExtension,
  OrderedListExtension,
  ParagraphExtension,
  Positioner,
  PositionerPosition,
} from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { ReactComponentExtension } from '@remirror/extension-react-component';
import { TableComponents, TableExtension } from '@remirror/extension-react-tables';
import { splitBlock } from '@remirror/pm/commands';
import { ContentMatch, Fragment } from '@remirror/pm/model';
import {
  AllSelection,
  NodeSelection,
  PluginKey,
  TextSelection,
  Transaction,
} from '@remirror/pm/state';
import { ProsemirrorNode } from '@remirror/pm/suggest';
import { canSplit } from '@remirror/pm/transform';
import { Decoration, DecorationSet, EditorView } from '@remirror/pm/view';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useHover,
  useKeymap,
  useKeymaps,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

export default { title: 'Draggable Blocks' };

const key = new PluginKey('remirrorDraggable');

interface Action {
  pos: number;
  node: ProsemirrorNode;
}

interface HoverPositionerData {
  pos: number;
  node: ProsemirrorNode;
}

/** it seems that I don't need to use a hover positioner here, because I don't
 * need to know the precise coordinate of the draggable handler. I can use CSS
 * `::before` to create the handler and use `top: 0; left: -40px` to place the
 * handler in the right place. */
const hoverPositioner = Positioner.create<HoverPositionerData>({
  /**
   * Determines whether anything has changed and whether to continue with a
   * recalculation. By default this is only true when the document has or
   * selection has changed.
   *
   * @remarks
   *
   * Sometimes it is useful to recalculate the positioner on every state update.
   * In this case you can set this method to always return true.
   *
   * ```ts
   * const positioner: Positioner = {
   *   hasStateChanged: () => true
   * };
   * ```
   */
  hasChanged: hasStateChanged,

  /**
   * Get the active items that will be passed into the `getPosition` method.
   */
  getActive: (props: GetActiveProps): HoverPositionerData[] => {
    const nodes = props.hover?.nodes;

    if (!nodes) {
      return [];
    }

    const node = findOrCreateDraggableNode(props.view, nodes);

    if (node) {
      return [node];
    }

    return [];
  },

  /**
   * Calculate and return an array of `VirtualPosition`'s which represent the
   * virtual element the positioner represents.
   */
  getPosition: (props: GetPositionProps<HoverPositionerData>): PositionerPosition => {
    return { x: 0, y: 0, width: 0, height: 0, rect: new DOMRect(), visible: true };
  },

  /**
   * An array of update listeners to determines when the positioner will update it's position.
   *
   * - `state` - updates when the prosemirror state is updated - default.
   * - `scroll` - updates when the editor is scrolled (debounced)
   *
   * @default ['state']
   */
  events: ['hover'],
});

class DraggableExtension extends PlainExtension {
  get name() {
    return 'draggable' as const;
  }

  // createDecorations(state: EditorState): DecorationSet {
  //   return null};
  // }

  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (
          tr: Transaction,
          set: DecorationSet,
          oldState: EditorState,
          newState: EditorState,
        ) => {
          const action: Action | null = tr.getMeta(key);

          if (!action && !tr.docChanged) {
            return set;
          }

          if (!action) {
            // Adjust decoration positions to changes made by the transaction
            return set.map(tr.mapping, tr.doc);
          }

          return DecorationSet.create(tr.doc, [
            Decoration.node(action.pos, action.pos + action.node.nodeSize, {
              class: 'hovering',
            }),
          ]);
        },
      },
      props: {
        decorations(state) {
          return this.getState(state);
        },
      },
    };
  }
}

class DraggableParagraphExtension extends ParagraphExtension {
  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'paragraphContent*',
      draggable: true,
      ...override,
      attrs: {
        ...extra.defaults(),
      },
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (node) => ({
            ...extra.parse(node),
          }),
        },
      ],

      toDOM: (node) => {
        return ['div', extra.dom(node), 0];
      },
    };
  }
}

class DraggableParagraphContentExtension extends NodeExtension {
  get name() {
    return 'paragraphContent' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'inline*',
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
      },
      parseDOM: [],

      toDOM: (node) => {
        return ['p', extra.dom(node), 0];
      },
    };
  }
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If a block node is selected, create an empty paragraph before (if
// it is its parent's first child) or after it.
// export function createParagraphNear(state: EditorState, dispatch: Dispatch) {
//   const sel = state.selection;
//   const { $from, $to } = sel;

//   if (sel instanceof AllSelection || $from.parent.inlineContent || $to.parent.inlineContent) {
//     return false;
//   }

//   const type = defaultBlockAt($to.parent.contentMatchAt($to.indexAfter()));

//   if (!type || !type.isTextblock) {
//     return false;
//   }

//   if (dispatch) {
//     const side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
//     const tr = state.tr.insert(side, type.createAndFill());
//     tr.setSelection(TextSelection.create(tr.doc, side + 1));
//     dispatch(tr.scrollIntoView());
//   }

//   return true;
// }

class DraggableParagraphWrapperExtension extends NodeExtension {
  get name() {
    return 'draggableParagraphWrapper' as const;
  }

  createTags() {
    return [ExtensionTag.LastNodeCompatible, ExtensionTag.Block, ExtensionTag.FormattingNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'paragraph+',
      draggable: true,
      ...override,
      attrs: {
        ...extra.defaults(),
      },
      parseDOM: [],

      toDOM: (node) => {
        return ['div', extra.dom(node), 0];
        // return [0];
      },
    };
  }

  createKeymap() {
    console.log('this.store.extensions:', this.store.extensions);

    return {
      // Enter: convertCommand(splitBlock),
    };
  }
}

const extensions = () => [
  // new DocExtension({ content: 'draggableParagraphWrapper+' }),

  // new KeymapExtension({ priority: ExtensionPriority. }),

  new ReactComponentExtension(),
  new TableExtension(),
  new BulletListExtension({ nodeOverride: { draggable: true } }),
  new OrderedListExtension({ nodeOverride: { draggable: true } }),
  new ListItemExtension({ nodeOverride: { draggable: true }, priority: ExtensionPriority.High }),
  new DraggableExtension(),
  new DropCursorExtension({ color: 'blue', width: 4 }),
  // new ParagraphExtension({ nodeOverride: { draggable: true } }),
  new DraggableParagraphWrapperExtension(),
  new BlockquoteExtension({ nodeOverride: { draggable: true } }),
  // new DraggableParagraphExtension({ priority: ExtensionPriority.High }),
  // new DraggableParagraphContentExtension({ priority: ExtensionPriority.High }),
];

/**
 * Find the draggable node that should show a draggable handler.
 */
function findOrCreateDraggableNode(
  view: EditorView,
  nodes: NodeWithPosition[],
): NodeWithPosition | null {
  let candidates: NodeWithPosition[] = [];
  let lastParagraph: NodeWithPosition | null = null;
  let lastParagraphWrapper: NodeWithPosition | null = null;

  for (const node of nodes) {
    console.log('[findOrCreateDraggableNode] name:', node.node?.type.name);

    if (node.node?.type.name === 'paragraph') {
      lastParagraph = node;
    }

    if (node.node?.type.name === 'draggableParagraphWrapper') {
      lastParagraphWrapper = node;
    }

    if (node.node?.type.isBlock && node.node.type.spec.draggable) {
      // TODO: node.node could be undefined, why?

      // all nodes inside a table are not draggable
      if (node.node.type.name === 'table') {
        candidates = [];
      }

      // all nodes insert a blockquote are not draggable
      if (node.node.type.name === 'blockquote') {
        candidates = [];
      }

      candidates.push(node);
    }
  }

  console.log('[findOrCreateDraggableNode] step 10 candidates:', candidates);
  console.log('[findOrCreateDraggableNode] step 10 lastParagraph:', lastParagraph);

  if (candidates.length === 0 && lastParagraph) {
    console.log('[findOrCreateDraggableNode] step 11');
    wrapParagraph(view, lastParagraph);
  } else if (
    candidates.length > 0 &&
    lastParagraph &&
    lastParagraphWrapper &&
    lastParagraphWrapper.node.childCount > 1
  ) {
    console.log('[findOrCreateDraggableNode] step 12');

    splitWrapper(view, lastParagraph, lastParagraphWrapper);
  }

  return candidates[0] || null;
}

// create a new DraggableParagraphWrapper node
function wrapParagraph(view: EditorView, lastParagraph: NodeWithPosition) {
  const schema: EditorSchema = view.state.schema;
  const wrapperType = schema.nodes.draggableParagraphWrapper;
  const wrapper = wrapperType?.createAndFill(null, lastParagraph.node);

  if (!wrapper) {
    return;
  }

  console.log('[findOrCreateDraggableNode] step 15', {
    from: lastParagraph.pos,
    to: lastParagraph.pos + lastParagraph.node.nodeSize,
  });

  view.dispatch(
    view.state.tr.replaceWith(
      lastParagraph.pos,
      lastParagraph.pos + lastParagraph.node.nodeSize,
      wrapper,
    ),
  );
}

function splitWrapper(
  view: EditorView,
  lastParagraph: NodeWithPosition,
  lastParagraphWrapper: NodeWithPosition,
) {
  const schema: EditorSchema = view.state.schema;
  const wrapperType = schema.nodes.draggableParagraphWrapper;

  // const wrapper = wrapperType?.createAndFill(null, lastParagraph.node);
  if (!wrapperType) {
    return;
  }

  const children: ProsemirrorNode[] = [];
  lastParagraphWrapper.node.forEach((child) => {
    children.push(wrapperType.createChecked(null, child));
  });
  const fragment = Fragment.fromArray(children);
  view.dispatch(
    view.state.tr.replaceWith(
      lastParagraphWrapper.pos,
      lastParagraphWrapper.pos + lastParagraphWrapper.node.nodeSize,
      fragment,
    ),
  );
}

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i++) {
    const { type } = match.edge(i);

    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    }
  }

  return null;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Split the parent block of the selection. If the selection is a text
// selection, also delete its content.
function splitParentBlock(state: EditorState, dispatch: DispatchFunction | undefined) {
  console.log('[splitParentBlock] step 1');

  if (!state.selection) {
    return false;
  }

  const { $from, $to } = state.selection;
  console.log('[splitParentBlock] step 2');

  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) {
      return false;
    }

    if (dispatch) {
      dispatch(state.tr.split($from.pos).scrollIntoView());
    }

    console.log('[splitParentBlock] step 5');

    return true;
  }

  if (!$from.parent.isBlock) {
    return false;
  }

  console.log('[splitParentBlock] step 7');

  if (dispatch) {
    const atEnd = $to.parentOffset === $to.parent.content.size;
    const tr = state.tr;

    if (state.selection instanceof TextSelection || state.selection instanceof AllSelection) {
      tr.deleteSelection();
    }

    const deflt =
      $from.depth === 0
        ? undefined
        : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));

    console.log('[splitParentBlock] step 9 deflt:', deflt?.name);

    let types = atEnd && deflt ? [{ type: deflt }] : undefined;
    let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);

    if (
      !types &&
      !can &&
      deflt &&
      canSplit(tr.doc, tr.mapping.map($from.pos), 1, (deflt && [{ type: deflt }]) || undefined)
    ) {
      types = [{ type: deflt }];
      can = true;
    }

    console.log('[splitParentBlock] step 12', { can, deflt: deflt?.name });

    if (deflt && can) {
      console.log('[splitParentBlock] step 13');

      tr.split(tr.mapping.map($from.pos), 1, types);

      if (
        !atEnd &&
        !$from.parentOffset &&
        $from.parent.type !== deflt &&
        $from
          .node(-1)
          .canReplace(
            $from.index(-1),
            $from.indexAfter(-1),
            Fragment.from([deflt.create(), $from.parent]),
          )
      ) {
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
      }
    }

    console.log('[splitParentBlock] step 30');

    dispatch(tr.scrollIntoView());
  }

  console.log('[splitParentBlock] step 31');

  return true;
}

function useDraggable() {
  // useKeymap('Enter', (props) => {
  //   console.log('[enter keymap]', props);

  //   const result = convertCommand(splitParentBlock)(props);

  //   console.log('[enter keymap] result:', result);
  //   return result;
  // });

  useHover(
    useCallback((params) => {
      console.log('hover event :', params);

      const node = findOrCreateDraggableNode(params.view, params.nodes);

      if (node) {
        const { view } = params;
        const action: Action = {
          pos: node.pos,
          node: node.node,
        };
        view.dispatch(view.state.tr.setMeta(key, action));
      }
    }, []),
  );
}

export const Main: Story = ({ children }) => {
  const { manager, state } = useRemirror({ extensions });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} hooks={[useDraggable]}>
          <EditorComponent />
          <TableComponents />
          <ProsemirrorDevTools />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

Main.args = {
  autoLink: true,
  openLinkOnClick: true,
};
