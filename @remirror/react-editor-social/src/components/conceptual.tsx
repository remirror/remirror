import React, { FC, useCallback, useMemo, useRef } from 'react';

import { isEmptyArray } from '@remirror/core';
import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import { SuggestKeyBindingMap, SuggestKeyBindingParameter } from '@remirror/pm/suggest';
import {
  RemirrorProvider,
  useCreateExtension,
  useExtension,
  useManager,
  useRemirror,
  useSetState,
} from '@remirror/react';

import {
  MatchName,
  MentionChangeParameter,
  SocialEditorProps,
  TagData,
  UserData,
} from '../social-types';
import { indexFromArrowPress } from '../social-utils';

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

interface MentionsProps {
  /**
   * List of users
   */
  users: UserData[];

  /**
   * List of tags
   */
  tags: TagData[];

  /**
   * Called any time there is a change in the mention
   */
  onChange: (params?: MentionChangeParameter) => void;
}

interface MentionsState {
  matcher: 'at' | 'tag' | undefined;
  index: number;
  hideSuggestions: boolean;
}

const Mentions: FC<MentionsProps> = (props) => {
  const [state, setState] = useSetState<MentionsState>({
    index: 0,
    matcher: undefined,
    hideSuggestions: false,
  });

  // When true, ignore the next exit to prevent double exits after a user interaction.
  const ignoreNextExit = useRef(false);

  const createArrowBinding = useCallback(
    (direction: 'up' | 'down') => {
      return (parameter: SuggestKeyBindingParameter) => {
        const { queryText, suggester } = parameter;
        const name = suggester.name as MatchName;
        const { index, hideSuggestions } = state;
        const { onChange, users, tags } = props;

        const matches = name === 'at' ? users : tags;

        if (hideSuggestions || isEmptyArray(matches)) {
          return false;
        }

        // pressed up arrow
        const activeIndex = indexFromArrowPress({
          direction,
          matchLength: matches.length,
          prevIndex: index,
        });

        setState({ index: activeIndex, matcher: name });
        onChange({
          name,
          query: queryText.full,
          activeIndex,
        });

        return true;
      };
    },
    [props, setState, state],
  );

  const ArrowUp = useMemo(() => createArrowBinding('up'), [createArrowBinding]);
  const ArrowDown = useMemo(() => createArrowBinding('down'), [createArrowBinding]);

  /**
   * These are the keyBindings for mentions extension. This allows for
   * overriding
   */
  const keyBindings: SuggestKeyBindingMap = useMemo(
    () => ({
      /**
       * Handle the enter key being pressed
       */
      Enter: (parameter) => {
        const { suggester, command } = parameter;
        const { char, name } = suggester;
        const { index, hideSuggestions } = state;
        const { users, tags } = props;

        if (hideSuggestions) {
          return false;
        }

        const { label, id, href } = getMentionLabel({ name, users, index, tags });

        // Only continue if user has an active selection and label.
        if (!label || !index) {
          return false;
        }

        ignoreNextExit.current = true;

        command({
          replacementType: 'full',
          id: id ?? label,
          label: `${char}${label}`,
          role: 'presentation',
          href: href ?? `/${id ?? label}`,
        });

        return true;
      },

      /**
       * Hide the suggesters when the escape key is pressed.
       */
      Escape: ({ suggester: { name } }) => {
        const matches = name === 'at' ? props.users : props.tags;

        if (isEmptyArray(matches)) {
          return false;
        }

        setState({ hideSuggestions: true });
        return true;
      },

      /**
       * Handle the up arrow being pressed
       */
      ArrowUp,

      /**
       * Handle the down arrow being pressed
       */
      ArrowDown,
    }),
    [ArrowDown, ArrowUp, props, setState, state],
  );

  useExtension(EmojiExtension, ({ addCustomHandler }) => {}, []);
};

interface GetMentionLabelParameter {
  name: string;
  users: UserData[];
  index: number;
  tags: TagData[];
}

function getMentionLabel(parameter: GetMentionLabelParameter) {
  const { name, users, index, tags } = parameter;
  const userData = name === 'at' && users.length > index ? users[index] : null;
  const tagData = name === 'tag' && tags.length > index ? tags[index] : null;

  const id = userData ? userData.id : tagData ? tagData.id : null;
  const label = userData ? userData.username : tagData ? tagData.tag : null;
  const href = userData ? userData.href : tagData ? tagData.href : null;
  return { label, id, href };
}
