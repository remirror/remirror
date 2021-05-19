import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  BoldExtension,
  BulletListExtension,
  createMarkPositioner,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  MentionAtomExtension,
  OrderedListExtension,
  ShortcutHandlerProps,
  UnderlineExtension,
} from 'remirror/extensions';
import {
  ComponentItem,
  EditorComponent,
  FloatingToolbar,
  FloatingWrapper,
  MentionAtomNodeAttributes,
  MentionAtomPopupComponent,
  MentionAtomState,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useActive,
  useAttrs,
  useChainedCommands,
  useCurrentSelection,
  useExtension,
  useRemirror,
  useUpdateReason,
} from '@remirror/react';

export default { title: 'Link Extension' };

const mentionAtomItems: MentionAtomNodeAttributes[] = [
  { id: 'tom', label: '@tom' },
  { id: 'tolu', label: '@tolu' },
  { id: 'andy', label: '@andy' },
  { id: 'ifi', label: '@ifi' },
  { id: 'bola', label: '@bola' },
  { id: 'ben', label: '@ben' },
  { id: 'kemi', label: '@kemi' },
  { id: 'lizzy', label: '@lizzy' },
  { id: 'julian', label: '@julian' },
  { id: 'li', label: '@li' },
  { id: 'ryo', label: '@ryo' },
  { id: 'dipok', label: '@dipok' },
];

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleUnderline', display: 'icon' },
    ],
    separator: 'end',
  },

  {
    type: ComponentItem.ToolbarMenu,
    menuLabel: 'Headings',
    label: 'Headings',
    items: [
      {
        type: ComponentItem.MenuGroup,
        role: 'radio',
        items: [
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 1 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 2 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 3 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 4 },
          },
        ],
      },
    ],
  },

  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleBulletList',
        display: 'icon',
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleOrderedList',
        display: 'icon',
      },
    ],
    separator: 'start',
  },

  {
    type: ComponentItem.ToolbarGroup,
    label: 'History',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleColumns',
        display: 'icon',
        attrs: { count: 2 },
      },
    ],
    separator: 'start',
  },
];

const floatingToolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleUnderline', display: 'icon' },
    ],
  },
];

export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
        <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />
        <FloatingLinkToolbar />
      </Remirror>
    </ThemeProvider>
  );
};

function useMentionAtomPopupState() {
  const [items, setItems] = useState(mentionAtomItems);

  const onChange = useCallback((mentionAtomState: MentionAtomState | null) => {
    console.log({ mentionAtomState });
    setItems(
      mentionAtomState
        ? mentionAtomItems.filter((item) => item.id.includes(mentionAtomState.query.full))
        : mentionAtomItems,
    );
  }, []);

  return useMemo(() => ({ items, onChange }), [items, onChange]);
}

function useLinkShortcut() {
  const [linkShortcut, setLinkShortcut] = useState<ShortcutHandlerProps | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  useExtension(
    LinkExtension,
    ({ addHandler }) =>
      addHandler('onShortcut', (props) => {
        if (!isEditing) {
          setIsEditing(true);
        }

        return setLinkShortcut(props);
      }),
    [isEditing],
  );

  return { linkShortcut, isEditing, setIsEditing };
}

function useFloatingLinkState() {
  const chain = useChainedCommands();
  const { isEditing, linkShortcut, setIsEditing } = useLinkShortcut();
  const { to, empty } = useCurrentSelection();

  const url = (useAttrs().link()?.href as string) ?? '';
  const [href, setHref] = useState<string>(url);

  // A positioner which only shows for links.
  const linkPositioner = useMemo(() => createMarkPositioner({ type: 'link' }), []);

  const onRemove = useCallback(() => {
    return chain.removeLink().focus().run();
  }, [chain]);

  const updateReason = useUpdateReason();

  useLayoutEffect(() => {
    if (!isEditing) {
      return;
    }

    if (updateReason.doc || updateReason.selection) {
      setIsEditing(false);
    }
  }, [isEditing, setIsEditing, updateReason.doc, updateReason.selection]);

  useEffect(() => {
    setHref(url);
  }, [url]);

  const submitHref = useCallback(() => {
    setIsEditing(false);
    const range = linkShortcut ?? undefined;

    if (href === '') {
      chain.removeLink();
    } else {
      chain.updateLink({ href, auto: false }, range);
    }

    chain.focus(range?.to ?? to).run();
  }, [setIsEditing, linkShortcut, chain, href, to]);

  const cancelHref = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  const clickEdit = useCallback(() => {
    if (empty) {
      chain.selectLink();
    }

    setIsEditing(true);
  }, [chain, empty, setIsEditing]);

  return useMemo(
    () => ({
      href,
      setHref,
      linkShortcut,
      linkPositioner,
      isEditing,
      clickEdit,
      onRemove,
      submitHref,
      cancelHref,
    }),
    [href, linkShortcut, linkPositioner, isEditing, clickEdit, onRemove, submitHref, cancelHref],
  );
}

const FloatingLinkToolbar = () => {
  const { isEditing, linkPositioner, clickEdit, onRemove, submitHref, href, setHref, cancelHref } =
    useFloatingLinkState();
  const active = useActive();
  const activeLink = active.link();
  const { empty } = useCurrentSelection();
  const linkEditItems: ToolbarItemUnion[] = useMemo(
    () => [
      {
        type: ComponentItem.ToolbarGroup,
        label: 'Link',
        items: activeLink
          ? [
              { type: ComponentItem.ToolbarButton, onClick: () => clickEdit(), icon: 'pencilLine' },
              { type: ComponentItem.ToolbarButton, onClick: onRemove, icon: 'linkUnlink' },
            ]
          : [{ type: ComponentItem.ToolbarButton, onClick: () => clickEdit(), icon: 'link' }],
      },
    ],
    [clickEdit, onRemove, activeLink],
  );

  const items: ToolbarItemUnion[] = useMemo(
    () => [...floatingToolbarItems, ...linkEditItems],
    [linkEditItems],
  );
  const mentionAtomPopup = useMentionAtomPopupState();

  return (
    <>
      <MentionAtomPopupComponent
        items={mentionAtomPopup.items}
        onChange={mentionAtomPopup.onChange}
      />
      <FloatingToolbar items={items} positioner='selection' placement='top' enabled={!isEditing} />
      <FloatingToolbar
        items={linkEditItems}
        positioner={linkPositioner}
        placement='bottom'
        enabled={!isEditing && empty}
      />

      <FloatingWrapper
        positioner='always'
        placement='bottom'
        enabled={isEditing}
        renderOutsideEditor
      >
        <input
          style={{ zIndex: 20 }}
          autoFocus
          onChange={(event) => setHref(event.target.value)}
          value={href}
          onKeyPress={(event) => {
            const { code } = event;

            if (code === 'Enter') {
              submitHref();
            }

            if (code === 'Escape') {
              cancelHref();
            }
          }}
        />
      </FloatingWrapper>
    </>
  );
};

const extensions = () => [
  new BoldExtension(),
  new LinkExtension({ autoLink: true }),
  new ItalicExtension(),
  new UnderlineExtension(),
  new HeadingExtension({ levels: [1, 2, 3, 4] }),
  new BulletListExtension(),
  new OrderedListExtension(),
  new MarkdownExtension(),
  new MentionAtomExtension({
    selectable: false,
    matchers: [{ name: 'at', char: '@', appendText: ' ' }],
  }),
];

const content = `This is a link <a href="https://remirror.io" target="_blank">here</a>.\n\n`;

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};
