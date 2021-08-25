import { FC, useCallback, useMemo, useState } from 'react';
import { IdentifierSchemaAttributes } from 'remirror';
import {
  EmojiExtension,
  LinkExtension,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
  PlaceholderExtension,
  TaskListExtension,
  wysiwygPreset,
} from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import {
  ComponentItem,
  EditorComponent,
  EmojiPopupComponent,
  FloatingToolbar,
  MentionAtomPopupComponent,
  MentionAtomState,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

const extraAttributes: IdentifierSchemaAttributes[] = [
  { identifiers: ['mention', 'emoji'], attributes: { role: { default: 'presentation' } } },
  { identifiers: ['mention'], attributes: { href: { default: null } } },
];

export interface SocialEditorProps extends Pick<MentionComponentProps, 'users' | 'tags'> {
  placeholder?: string;
}

const toolbarItems: ToolbarItemUnion[] = [
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
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Clipboard',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'copy', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'cut', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'paste', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Heading Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 3 },
      },
    ],
    separator: 'end',
  },
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
    type: ComponentItem.ToolbarGroup,
    label: 'Lists',
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
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleTaskList', display: 'icon' },
    ],
    separator: 'none',
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
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
    ],
  },
];

interface MentionComponentProps<
  UserData extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> {
  users?: UserData[];
  tags?: string[];
}

function MentionComponent({ users, tags }: MentionComponentProps) {
  const [mentionState, setMentionState] = useState<MentionAtomState | null>();
  const tagItems = useMemo(
    () => (tags ?? []).map((tag) => ({ id: tag, label: `#${tag}` })),
    [tags],
  );
  const items = useMemo(() => {
    if (!mentionState) {
      return [];
    }

    const allItems = mentionState.name === 'at' ? users : tagItems;

    if (!allItems) {
      return [];
    }

    const query = mentionState.query.full.toLowerCase() ?? '';
    return allItems.filter((item) => item.label.toLowerCase().includes(query)).sort();
  }, [mentionState, users, tagItems]);

  return <MentionAtomPopupComponent onChange={setMentionState} items={items} />;
}

export const SocialEditor: FC<SocialEditorProps> = ({ placeholder, ...props }) => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new LinkExtension({ autoLink: true }),
      new MentionAtomExtension({
        matchers: [
          { name: 'at', char: '@', appendText: ' ' },
          { name: 'tag', char: '#', appendText: ' ' },
        ],
      }),
      new EmojiExtension({ plainText: false, data, moji: 'noto' }),
      new TaskListExtension({}),
      ...wysiwygPreset(),
    ],
    [placeholder],
  );

  const { children } = props;
  const { manager } = useRemirror({ extensions, extraAttributes });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager}>
          <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />
          <EditorComponent />
          <EmojiPopupComponent />
          <MentionComponent {...props} />
          <FloatingToolbar items={floatingToolbarItems} positioner='selection' placement='bottom' />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};
