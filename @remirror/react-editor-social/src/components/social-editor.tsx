import React, { FC, useMemo } from 'react';

import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import {
  I18nProvider,
  RemirrorProvider,
  useCreateExtension,
  useManager,
  useRemirror,
} from '@remirror/react';

import { SocialEditorProps } from '../social-types';
import { CharacterCountIndicator, CharacterCountWrapper } from './social-character-count';
import { EmojiSuggestions } from './social-emoji';
import { MentionSuggestions } from './social-mentions';

/**
 * The social editor.
 */
export const SocialEditor: FC<SocialEditorProps> = (props) => {
  const {
    extensions = [],
    presets = [],
    atMatcherOptions,
    tagMatcherOptions,
    children,
    i18n,
    locale,
  } = props;
  const mentionExtensionSettings = useMemo(
    () => ({
      matchers: [
        { name: 'at', char: '@', appendText: ' ', ...atMatcherOptions },
        { name: 'tag', char: '#', appendText: ' ', ...tagMatcherOptions },
      ],
    }),
    [atMatcherOptions, tagMatcherOptions],
  );

  const mentionExtension = useCreateExtension(MentionExtension, mentionExtensionSettings);
  const emojiExtension = useCreateExtension(EmojiExtension, {
    extraAttributes: { role: { default: 'presentation' } },
  });

  const autoLinkExtension = useCreateExtension(AutoLinkExtension, { defaultProtocol: 'https:' });
  const combined = useMemo(
    () => [...extensions, ...presets, mentionExtension, emojiExtension, autoLinkExtension],
    [autoLinkExtension, emojiExtension, extensions, mentionExtension, presets],
  );

  const manager = useManager(combined);

  return (
    <I18nProvider i18n={i18n} locale={locale}>
      <RemirrorProvider manager={manager} childAsRoot={false}>
        <Editor {...props}>{children}</Editor>
      </RemirrorProvider>
    </I18nProvider>
  );
};

/**
 * The editing functionality within the Social Editor context.
 */
const Editor: FC<SocialEditorProps> = (props) => {
  const { children, characterLimit = 280 } = props;

  const { getRootProps, state } = useRemirror();
  const used = state.newState.doc.textContent.length;

  return (
    <div>
      <div className='inner-editor'>
        <div className='remirror-social-editor' {...getRootProps()} />
        <EmojiSuggestions />
        {characterLimit != null && (
          <CharacterCountWrapper>
            <CharacterCountIndicator characters={{ maximum: characterLimit, used }} />
          </CharacterCountWrapper>
        )}
        {children}
      </div>
      <MentionSuggestions
        tags={props.tagData}
        users={props.userData}
        onChange={props.onMentionChange}
      />
    </div>
  );
};
