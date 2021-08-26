import { FC, useCallback, useMemo, useState } from 'react';
import { IdentifierSchemaAttributes } from 'remirror';
import {
  EmojiExtension,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
  PlaceholderExtension,
  wysiwygPreset,
} from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import {
  EditorComponent,
  EmojiPopupComponent,
  MentionAtomPopupComponent,
  MentionAtomState,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

import { BubbleMenu } from '../components/bubble-menu';
import { TopToolbar } from '../components/top-toolbar';

const extraAttributes: IdentifierSchemaAttributes[] = [
  { identifiers: ['mention', 'emoji'], attributes: { role: { default: 'presentation' } } },
  { identifiers: ['mention'], attributes: { href: { default: null } } },
];

export interface SocialEditorProps extends Pick<MentionComponentProps, 'users' | 'tags'> {
  placeholder?: string;
}

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
      new MentionAtomExtension({
        matchers: [
          { name: 'at', char: '@', appendText: ' ' },
          { name: 'tag', char: '#', appendText: ' ' },
        ],
      }),
      new EmojiExtension({ plainText: false, data, moji: 'noto' }),
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
          <TopToolbar />
          <EditorComponent />
          <EmojiPopupComponent />
          <MentionComponent {...props} />
          <BubbleMenu />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};
