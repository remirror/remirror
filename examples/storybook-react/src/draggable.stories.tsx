import './draggable.css';

import { Story } from '@storybook/react';
import { CreateExtensionPlugin, EditorState, NodeWithPosition, PlainExtension } from 'remirror';
import { BulletListExtension, OrderedListExtension, ParagraphExtension } from 'remirror/extensions';
import { ReactComponentExtension } from '@remirror/extension-react-component';
import { TableComponents, TableExtension } from '@remirror/extension-react-tables';
import { Plugin, PluginKey, Transaction } from '@remirror/pm/state';
import { ProsemirrorNode } from '@remirror/pm/suggest';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { EditorComponent, Remirror, ThemeProvider, useEvent, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

export default { title: 'Draggable' };

const key = new PluginKey('remirrorDraggable');

interface Action {
  pos: number;
  node: ProsemirrorNode;
}

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

const extensions = () => [
  new ReactComponentExtension(),
  new TableExtension(),
  new BulletListExtension(),
  new OrderedListExtension(),
  new DraggableExtension(),
  new ParagraphExtension({ nodeOverride: { draggable: true } }),
];

function findFirstBlockNode(nodes: NodeWithPosition[]): NodeWithPosition | null {
  console.log('nodes:', nodes);

  for (const node of nodes) {
    if (node.node?.type.isBlock) {
      // TODO: node.node could be undefined
      return node;
    }
  }

  return null;
}

function useDraggable() {
  useEvent('hover', (params) => {
    console.log('hover event:', params.nodes);
    const node = findFirstBlockNode(params.nodes);

    if (node) {
      const { view } = params;
      const action: Action = {
        pos: node.pos,
        node: node.node,
      };
      view.dispatch(view.state.tr.setMeta(key, action));
    }
  });
}

export const Main: Story = ({ children }) => {
  const { manager, state } = useRemirror({ extensions });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} hooks={[useDraggable]}>
          <EditorComponent />
          <TableComponents />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

Main.args = {
  autoLink: true,
  openLinkOnClick: true,
};
