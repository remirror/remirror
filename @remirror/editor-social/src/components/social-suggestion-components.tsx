import { Attrs, EditorView, Position, RemirrorTheme } from '@remirror/core';
import { EmojiObject, EmojiSuggestCommand } from '@remirror/extension-emoji';
import { MentionExtensionAttrs, SuggestionStateMatch } from '@remirror/extension-mention';
import { bubblePositioner, useRemirrorContext } from '@remirror/react';
import { useRemirrorTheme } from '@remirror/ui';
import { Type, useMultishift } from 'multishift';
import React, { forwardRef, FunctionComponent } from 'react';
import {
  DataParams,
  DivProps,
  ImgProps,
  SocialExtensions,
  SpanProps,
  TagSuggestionsProps,
  UserSuggestionsProps,
} from '../social-types';

type SuggestionsDropdownProps = DivProps & {
  position?: Partial<Position> & { position?: 'absolute' };
};

const SuggestionsDropdown = forwardRef<HTMLDivElement, SuggestionsDropdownProps>(
  ({ position = {}, ...props }, ref) => {
    const { sx, css } = useRemirrorTheme();

    return (
      <div
        {...props}
        ref={ref}
        css={sx(
          {
            alignItems: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            flexBasis: 'auto',
            flexShrink: '0',
            margin: '0',
            overflow: 'hidden',
            listStyle: 'none',
            padding: '0',
          },
          css(position),
        )}
      />
    );
  },
);

const ItemWrapper = forwardRef<HTMLSpanElement, SpanProps & { active: boolean }>(
  ({ active, ...props }, ref) => {
    const { css } = useRemirrorTheme();

    return (
      <span
        {...props}
        ref={ref}
        css={(theme: RemirrorTheme) => css`
          display: flex;
          flex-direction: row;
          align-items: center;
          border-bottom: 1px solid rgb(230, 236, 240);
          padding: 7px 15px 6px 10px;
          font-size: 14px;
          ${active ? 'background-color: rgb(245, 248, 250);' : ''}

          &:hover {
            background-color: ${theme.colors.primaryBackground};
          }
          &:hover span {
            color: ${theme.colors.primary};
          }
        `}
      />
    );
  },
);

const AtImage = forwardRef<HTMLImageElement, ImgProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <img
      {...props}
      ref={ref}
      css={sx({ width: '32px', height: '32px', marginRight: '10px', borderRadius: '50%' })}
    />
  );
});

const AtDisplayName = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={sx({ marginRight: '5px', color: '#14171a', wordBreak: 'break-all', fontWeight: 'bold' })}
    />
  );
});

const AtUsername = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return <span {...props} ref={ref} css={css({ color: '#657786' })} />;
});

interface CreateOnClickMethodFactoryParams {
  getMention: () => SuggestionStateMatch;
  setExitTriggeredInternally: () => void;
  view: EditorView;
  command(attrs: Attrs): void;
}

/**
 * This method helps create the onclick factory method used by both types of suggestions supported
 */
const createOnClickMethodFactory = ({
  getMention,
  setExitTriggeredInternally,
  view,
  command,
}: CreateOnClickMethodFactoryParams) => (id: string) => () => {
  const { char, name, range } = getMention();

  const params: MentionExtensionAttrs = {
    id,
    label: `${char}${id}`,
    name,
    replacementType: 'full',
    range,
    role: 'presentation',
    href: `/${id}`,
  };

  setExitTriggeredInternally(); // Prevents further `onExit` calls
  command(params);

  if (!view.hasFocus()) {
    view.focus();
  }
};

/**
 * Render the suggestions for mentioning a user.
 */
export const AtSuggestions: FunctionComponent<UserSuggestionsProps> = ({
  getMention,
  data,
  setExitTriggeredInternally,
}) => {
  const { view, actions } = useRemirrorContext<SocialExtensions>();

  /**
   * Click handler for accepting a user suggestion
   */
  const onClickFactory = createOnClickMethodFactory({
    command: actions.updateMention,
    getMention,
    setExitTriggeredInternally,
    view,
  });

  return (
    <SuggestionsDropdown role='presentation'>
      {data.map(user => {
        return (
          <ItemWrapper
            active={user.active}
            className={`suggestions-item${user.active ? ' active' : ''}`}
            key={user.username}
            aria-selected={user.active ? 'true' : 'false'}
            aria-haspopup='false'
            role='option'
            onClick={onClickFactory(user.username)}
          >
            <AtImage src={user.avatarUrl} />
            <AtDisplayName className='display-name'>{user.displayName}</AtDisplayName>
            <AtUsername className='username'>@{user.username}</AtUsername>
          </ItemWrapper>
        );
      })}
    </SuggestionsDropdown>
  );
};

const HashTagText = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={theme => css`
        font-weight: bold;
        color: #66757f;

        &:hover {
          text-decoration: underline;
          color: ${theme.colors.primary};
        }
      `}
    />
  );
});

/**
 * Render the suggestions for tagging.
 */
export const TagSuggestions: FunctionComponent<TagSuggestionsProps> = ({
  getMention,
  data,
  setExitTriggeredInternally,
}) => {
  const { view, actions } = useRemirrorContext<SocialExtensions>();

  /**
   * Click handler for accepting a tag suggestion
   */
  const onClickFactory = createOnClickMethodFactory({
    command: actions.updateMention,
    getMention,
    setExitTriggeredInternally,
    view,
  });

  return (
    <SuggestionsDropdown role='presentation'>
      {data.map(({ tag, active }) => (
        <ItemWrapper
          active={active}
          className={`suggestions-item${active ? ' active' : ''}`}
          key={tag}
          aria-selected={active ? 'true' : 'false'}
          aria-haspopup='false'
          role='option'
          onClick={onClickFactory(tag)}
        >
          <HashTagText>#{tag}</HashTagText>
        </ItemWrapper>
      ))}
    </SuggestionsDropdown>
  );
};

interface EmojiSuggestionsProps extends DataParams<EmojiObject> {
  highlightedIndex: number;
  command: EmojiSuggestCommand;
}

/**
 * Render the suggestions for tagging.
 */
export const EmojiSuggestions: FunctionComponent<EmojiSuggestionsProps> = ({
  data,
  highlightedIndex,
  command,
}) => {
  const { view, getPositionerProps } = useRemirrorContext<SocialExtensions>();
  const { getMenuProps, getItemProps, itemHighlightedAtIndex } = useMultishift({
    highlightedIndexes: [highlightedIndex],
    type: Type.ControlledMenu,
    items: data,
  });

  const { top, left, ref } = getPositionerProps({
    ...bubblePositioner,
    hasChanged: () => true,
    isActive: () => true,
    positionerId: 'emojiBubbleMenu',
  });

  return (
    <SuggestionsDropdown
      {...getMenuProps({ role: 'presentation', ref })}
      position={{ top, left, position: 'absolute' }}
    >
      {data.map((emoji, index) => {
        const active = itemHighlightedAtIndex(index);
        return (
          <ItemWrapper
            active={active}
            key={emoji.name}
            {...getItemProps({
              className: `suggestions-item${active ? ' active' : ''}`,
              role: 'option',
              onClick: () => {
                command(emoji);
                view.focus();
              },
              item: emoji,
              index,
            })}
          >
            <HashTagText>
              {emoji.char} {emoji.description}
            </HashTagText>
          </ItemWrapper>
        );
      })}
    </SuggestionsDropdown>
  );
};
