import './draggable.css';

import { Story } from '@storybook/react';
import { useCallback } from 'react';
import {
  ApplySchemaAttributes,
  CreateExtensionPlugin,
  EditorSchema,
  EditorState,
  ExtensionPriority,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeWithPosition,
  PlainExtension,
} from 'remirror';
import {
  BlockquoteExtension,
  BulletListExtension,
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
import { PluginKey, Transaction } from '@remirror/pm/state';
import { ProsemirrorNode } from '@remirror/pm/suggest';
import { Decoration, DecorationSet, EditorView } from '@remirror/pm/view';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useEvent,
  useHover,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

import { NeteaseCloudMusicFillIcon } from '../../../packages/remirror__react/node_modules/@remirror/react-components/src/all-icons';

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

    const node = findDraggableNode(props.view, nodes);

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

class DraggableParagraphWrapperExtension extends NodeExtension {
  get name() {
    return 'draggableParagraphWrapper' as const;
  }

  createTags() {
    return [ExtensionTag.LastNodeCompatible, ExtensionTag.Block, ExtensionTag.FormattingNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'paragraph*',
      draggable: true,
      ...override,
      attrs: {
        ...extra.defaults(),
      },
      parseDOM: [],

      toDOM: (node) => {
        return ['div', extra.dom(node), 0];
      },
    };
  }
}

const extensions = () => [
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
function findDraggableNode(view: EditorView, nodes: NodeWithPosition[]): NodeWithPosition | null {
  let candidates: NodeWithPosition[] = [];
  let lastParagraph: NodeWithPosition | null = null;

  for (const node of nodes) {
    console.log('[findDraggableNode] name:', node.node?.type.name);

    if (node.node?.type.name === 'paragraph') {
      lastParagraph = node;
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

  console.log('[findDraggableNode] step 10 candidates:', candidates);
  console.log('[findDraggableNode] step 10 lastParagraph:', lastParagraph);

  if (candidates.length === 0 && lastParagraph) {
    console.log('[findDraggableNode] step 11');

    // create a new DraggableParagraphWrapper node
    const schema: EditorSchema = view.state.schema;
    const wrapper = schema.nodes.draggableParagraphWrapper?.createAndFill(null, lastParagraph.node);

    if (wrapper) {
      console.log('[findDraggableNode] step 15', {
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
  }

  return candidates[0] || null;
}

function useDraggable() {
  useHover(
    useCallback((params) => {
      console.log('hover event:', params);

      const node = findDraggableNode(params.view, params.nodes);

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
