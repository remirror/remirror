import React, { FC, useMemo } from 'react';

import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import { RemirrorProvider, useCreateExtension, useManager } from '@remirror/react';

import { SocialEditorProps } from '../social-types';

/**
 * The wrapper for the social editor that provides the context for all te nested
 * editor components to use.
 */
const SocialEditorWrapper: FC<SocialEditorProps> = (props) => {
  const { extensions = [], presets = [], atMatcherOptions, tagMatcherOptions, children } = props;
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
  const emojiExtension = useCreateExtension(EmojiExtension);
  const autoLinkExtension = useCreateExtension(AutoLinkExtension, { defaultProtocol: 'https:' });
  const combined = useMemo(
    () => [...extensions, ...presets, mentionExtension, emojiExtension, autoLinkExtension],
    [autoLinkExtension, emojiExtension, extensions, mentionExtension, presets],
  );

  const manager = useManager(combined);

  return (
    <RemirrorProvider manager={manager} childAsRoot={false}>
      <Editor {...props}>{children}</Editor>
    </RemirrorProvider>
  );
};

const Editor: FC<SocialEditorProps> = (props) => {
  const { children } = props;

  return <>{children}</>;
};

const Emoji;
