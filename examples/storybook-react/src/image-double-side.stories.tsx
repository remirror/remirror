import './draggable.css';

import { Story } from '@storybook/react';
import { h } from 'jsx-dom';
import { Dispatch, useCallback } from 'react';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  convertCommand,
  CreateExtensionPlugin,
  DispatchFunction,
  EditorSchema,
  EditorState,
  ExtensionPriority,
  ExtensionTag,
  getTextSelection,
  KeymapExtension,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeView,
  NodeViewMethod,
  NodeWithPosition,
  PlainExtension,
  PrimitiveSelection,
} from 'remirror';
import {
  BlockquoteExtension,
  BulletListExtension,
  DocExtension,
  DropCursorExtension,
  GetActiveProps,
  GetPositionProps,
  hasStateChanged,
  ImageAttributes,
  ImageExtension,
  ImageExtensionAttributes,
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
  useCommands,
  useHover,
  useKeymap,
  useKeymaps,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

export default { title: 'ImageX' };

class FileNodeView implements NodeView {
  /**
   * The dom element which wraps the Image element. This is directly
   * controlled by ProseMirror.
   */
  dom: HTMLElement;
  contentDOM: HTMLElement;

  private node: ProsemirrorNode;
  private card: HTMLElement;
  private menu: HTMLElement;
  private menuButton: HTMLElement;
  private getPos: () => number;

  constructor(node: ProsemirrorNode, view: EditorView, getPos: () => number) {
    this.node = node;
    this.getPos = getPos;

    this.menuButton = h(
      'button',
      {
        onClick: (event) => {
          console.log('[FileNodeView] click');
          let attrs = this.node.attrs as FileExtensionAttributes;
          attrs = { ...attrs, mode: attrs.mode === 'preview' ? 'card' : 'preview' };
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, attrs));
        },
      },
      'click me',
    );
    this.menu = h('div', null, this.menuButton);
    this.card = h('div');
    this.contentDOM = h('div');
    this.dom = h('div', null, this.menu, this.card, this.contentDOM);

    this.render(this.node);
  }

  private render(node: ProsemirrorNode) {
    const attrs = node.attrs as FileExtensionAttributes;

    if (attrs.mode === 'preview') {
      this.contentDOM.style.display = 'block';
      this.card.style.display = 'none';
      this.menuButton.textContent = 'current mode: preview';
    } else {
      this.contentDOM.style.display = 'none';
      this.card.style.display = 'block';
      this.menuButton.textContent = 'current mode: card';
    }

    this.card.textContent = `filename: ${node.child(0)?.attrs?.fileName}`;
  }

  update(node: ProsemirrorNode): boolean {
    if (node.type.name !== this.node.type.name) {
      return false;
    }

    this.node = node;
    this.render(this.node);
    return true;
  }
}

export interface FileExtensionAttributes {
  mode: 'preview' | 'card';
}

class FileExtension extends NodeExtension {
  get name() {
    return 'file' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      group: 'block',
      content: 'image',
      marks: '',
      defining: true,
      ...override,
      attrs: {
        ...extra.defaults(),
        mode: { default: 'preview' },
      },
      toDOM() {
        return ['div', 0];
      },
      isolating: true,
    };
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) =>
      new FileNodeView(node, view, getPos as () => number);
  }

  @command()
  insertFileImage(attributes: ImageAttributes, selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      const imageNode = this.store.schema.nodes['image']?.create(attributes);
      const fileNode = this.type.createAndFill(null, imageNode);

      if (fileNode) {
        dispatch?.(tr.replaceRangeWith(from, to, fileNode));
      }

      return true;
    };
  }
}

const extensions = () => [
  new ImageExtension(),
  new FileExtension({ priority: ExtensionPriority.High }),
];

export const Main: Story = ({ children }) => {
  const { manager, state } = useRemirror({ extensions });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state}>
          <CommandMenu />
          <EditorComponent />
          <ProsemirrorDevTools />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

const CommandMenu: React.FC = () => {
  const commands = useCommands();
  const insertImage = () => {
    commands.insertFileImage({
      align: 'center',
      height: '100',
      width: '100',
      src: 'https://via.placeholder.com/100',
      title: 'This is the image title',
      fileName: 'hello.png',
    });
  };
  return <button onClick={insertImage}>insert image</button>;
};

declare global {
  namespace Remirror {
    interface AllExtensions {
      file: FileExtension;
    }

    interface BaseExtension {
      /**
       * Awesome stuff
       */
      a: string;
    }
  }
}
