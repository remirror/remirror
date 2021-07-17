import { FC } from 'react';
import { IdentifierSchemaAttributes } from 'remirror';
import { EmojiExtension, LinkExtension, MentionExtension } from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import {
  EditorComponent,
  EmojiPopupComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new MentionExtension({
    matchers: [
      { name: 'at', char: '@', appendText: ' ' },
      { name: 'tag', char: '#', appendText: ' ' },
    ],
  }),
  new EmojiExtension({ plainText: false, data, moji: 'noto' }),
];

const extraAttributes: IdentifierSchemaAttributes[] = [
  { identifiers: ['mention', 'emoji'], attributes: { role: { default: 'presentation' } } },
  { identifiers: ['mention'], attributes: { href: { default: null } } },
];

export interface SocialEditorProps {}

export const SocialEditor: FC = (props) => {
  const { children } = props;
  const { manager } = useRemirror({ extensions, extraAttributes });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager}>
          <EditorComponent />
          <EmojiPopupComponent />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};
