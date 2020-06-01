import React, { FC, useMemo } from 'react';

import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import { RemirrorProvider, useCreateExtension, useManager, useRemirror } from '@remirror/react';

import { SocialEditorProps } from '../../social-types';
import { Mentions } from './social-mentions';

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
    <RemirrorProvider manager={manager} childAsRoot={false}>
      <Editor {...props}>{children}</Editor>
    </RemirrorProvider>
  );
};

const Editor: FC<SocialEditorProps> = (props) => {
  const { children } = props;

  const { getRootProps } = useRemirror();

  return (
    <div>
      <div className='inner-editor'>
        <div className='remirror-social-editor' {...getRootProps()} />
        {children}
      </div>
      <Mentions tags={props.tagData} users={props.userData} onChange={props.onMentionChange} />
    </div>
  );
};
