import {
  ExtensionTag,
  findParentNode,
  KeyBindingProps,
  KeyBindings,
  PlainExtension,
  ProsemirrorNode,
} from 'remirror';
import {
  BulletListExtension,
  CodeExtension,
  HeadingExtension,
  OrderedListExtension,
  TaskListExtension,
  wrapSelectedItems,
} from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [
  new BulletListExtension(),
  new OrderedListExtension(),
  new TaskListExtension(),
  new HeadingExtension(),
  new ToggleListItemExtension(),
  new CodeExtension(),
];

const html = String.raw; // Just for better editor support
const content = html`
  <ul>
    <li>
      <p>
        Press <code>Ctrl-Enter</code> (or <code>Command-Enter</code> on macOS) to toggle selected
        list item type
      </p>
    </li>
    <li>
      <p>between bullet, ordered, checked, and unchecked.</p>
      <ul>
        <li>
          <p>
            You can also change a list item type by adding <code>- </code>, <code>1. </code>,
            <code>[x] </code>, or <code>[ ] </code> at the begin of a list item
          </p>
        </li>
      </ul>
    </li>
  </ul>
`;

const Toggleable = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: extensions,
    content,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

function isListItemNode(node: ProsemirrorNode): boolean {
  return !!node.type.spec.group?.includes(ExtensionTag.ListItemNode);
}

class ToggleListItemExtension extends PlainExtension {
  readonly name = 'toggleListItem';

  createKeymap(): KeyBindings {
    return {
      'Mod-Enter': (props): boolean => {
        return this.toggleListType(props);
      },
    };
  }

  private toggleListType({ state: { schema }, tr, dispatch }: KeyBindingProps): boolean {
    const foundListItem = findParentNode({
      selection: tr.selection,
      predicate: isListItemNode,
    });

    if (!foundListItem) {
      return false;
    }

    const { node: listItem } = foundListItem;

    const list = tr.doc.resolve(foundListItem.pos).parent;

    // cover ordered list item to bullet list item
    if (list.type.name === 'orderedList') {
      wrapSelectedItems({
        listType: schema.nodes.bulletList!,
        itemType: schema.nodes.listItem!,
        tr,
      });
      dispatch?.(tr);
      return true;
    }

    // cover bullet list item to unchecked task item
    else if (list.type.name === 'bulletList') {
      wrapSelectedItems({
        listType: schema.nodes.taskList!,
        itemType: schema.nodes.taskListItem!,
        tr,
      });
      dispatch?.(tr);
      return true;
    }

    // cover uncheck task item to checked task item
    else if (listItem.type.name === 'taskListItem' && !listItem.attrs.checked) {
      this.store.commands.toggleCheckboxChecked();
      return true;
    }

    // cover check task item to ordered list item
    else if (listItem.type.name === 'taskListItem' && !!listItem.attrs.checked) {
      wrapSelectedItems({
        listType: schema.nodes.orderedList!,
        itemType: schema.nodes.listItem!,
        tr,
      });
      dispatch?.(tr);
      return true;
    }

    return false;
  }
}

export default Toggleable;
