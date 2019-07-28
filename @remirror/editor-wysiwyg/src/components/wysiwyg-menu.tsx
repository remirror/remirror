import {
  faBold,
  faCode,
  faGripLines,
  faHeading,
  faItalic,
  faLink,
  faList,
  faListOl,
  faQuoteRight,
  faRedoAlt,
  faStrikethrough,
  faTimes,
  faUnderline,
  faUndoAlt,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import keyCode from 'keycode';
import React, {
  ChangeEventHandler,
  DOMAttributes,
  FC,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ActionNames, ActionNamesFromExtensionList, Attrs, memoize } from '@remirror/core';
import { bubblePositioner, useRemirror } from '@remirror/react';
import { ButtonState, styled } from '../wysiwyg-theme';
import { WysiwygExtensionList } from '../wysiwyg-types';
import {
  BubbleContent,
  BubbleMenuTooltip,
  IconButton,
  Toolbar,
  WithPaddingProps,
} from './wysiwyg-components';

const menuItems: Array<[ActionNames<WysiwygExtensionList>, [IconDefinition, string?], Attrs?]> = [
  ['bold', [faBold]],
  ['italic', [faItalic]],
  ['underline', [faUnderline]],
  ['strike', [faStrikethrough]],
  ['toggleHeading', [faHeading, '1'], { level: 1 }],
  ['toggleHeading', [faHeading, '2'], { level: 2 }],
  ['toggleHeading', [faHeading, '3'], { level: 3 }],
  ['undo', [faUndoAlt]],
  ['redo', [faRedoAlt]],
  ['toggleBulletList', [faList]],
  ['toggleOrderedList', [faListOl]],
  ['blockquote', [faQuoteRight]],
  ['toggleCodeBlock', [faCode]],
  ['horizontalRule', [faGripLines]],
];

const runAction = memoize(
  (method: (attrs?: Attrs) => void, attrs?: Attrs): MouseEventHandler<HTMLElement> => e => {
    e.preventDefault();
    method(attrs);
  },
);

/**
 * Retrieve the state for the button
 */
const getButtonState = (active: boolean, inverse = false): ButtonState =>
  active ? (inverse ? 'active-inverse' : 'active-default') : inverse ? 'inverse' : 'default';

interface MenuBarProps extends Pick<BubbleMenuProps, 'activateLink'> {
  inverse?: boolean;
}

/**
 * The MenuBar component which renders the actions that can be taken on the text within the editor.
 */
export const MenuBar: FC<MenuBarProps> = ({ inverse, activateLink }) => {
  const { actions } = useRemirror<WysiwygExtensionList>();

  return (
    <Toolbar>
      {menuItems.map(([name, [icon, subText], attrs], index) => {
        const buttonState = getButtonState(actions[name].isActive(attrs), inverse);

        return (
          <MenuItem
            index={index}
            key={index}
            icon={icon}
            subText={subText}
            state={buttonState}
            disabled={!actions[name].isEnabled()}
            onClick={runAction(actions[name], attrs)}
            withPadding='right'
          />
        );
      })}
      <MenuItem
        icon={faLink}
        state={getButtonState(actions.updateLink.isActive(), inverse)}
        disabled={!actions.updateLink.isEnabled()}
        onClick={activateLink}
        withPadding='right'
      />
    </Toolbar>
  );
};

interface MenuItemProps extends Partial<WithPaddingProps> {
  state: ButtonState;
  onClick: DOMAttributes<HTMLButtonElement>['onClick'];
  icon: IconDefinition;
  inverse?: boolean;
  disabled?: boolean;
  subText?: string;
  index?: number;
}

/**
 * A single clickable menu item for editing the styling and format of the text.
 */
const MenuItem: FC<MenuItemProps> = ({
  state,
  onClick,
  icon,
  inverse = false,
  disabled = false,
  subText,
  withPadding,
  index,
}) => {
  return (
    <IconButton onClick={onClick} state={state} disabled={disabled} withPadding={withPadding} index={index}>
      <FontAwesomeIcon icon={icon} inverse={inverse} size='1x' />
      {subText}
    </IconButton>
  );
};

export interface BubbleMenuProps {
  linkActivated: boolean;
  deactivateLink(): void;
  activateLink(): void;
}

const bubbleMenuItems: Array<[string, [IconDefinition, string?], Attrs?]> = [
  ['bold', [faBold]],
  ['italic', [faItalic]],
  ['underline', [faUnderline]],
];

export const BubbleMenu: FC<BubbleMenuProps> = ({ linkActivated = false, deactivateLink, activateLink }) => {
  const { actions, getPositionerProps } = useRemirror<WysiwygExtensionList>();
  const { bottom, left, ref } = getPositionerProps({
    ...bubblePositioner,
    isActive: params =>
      (bubblePositioner.isActive(params) || linkActivated) && !actions.toggleCodeBlock.isActive(),
    positionerId: 'bubbleMenu',
  });

  const updateLink = (href: string) => actions.updateLink({ href });
  const removeLink = () => actions.removeLink();
  const canRemove = () => actions.removeLink.isActive();

  return (
    <BubbleMenuTooltip ref={ref} bottom={bottom + 5} left={left}>
      {linkActivated ? (
        <LinkInput {...{ deactivateLink, updateLink, removeLink, canRemove }} />
      ) : (
        <BubbleContent>
          {bubbleMenuItems.map(([name, [icon, subText], attrs], index) => {
            const buttonState = getButtonState(actions[name].isActive(attrs), true);

            return (
              <MenuItem
                key={index}
                icon={icon}
                subText={subText}
                state={buttonState}
                disabled={!actions[name].isEnabled()}
                onClick={runAction(actions[name], attrs)}
                inverse={true}
                withPadding='horizontal'
              />
            );
          })}
          <MenuItem
            icon={faLink}
            state={getButtonState(actions.updateLink.isActive(), true)}
            onClick={activateLink}
            inverse={true}
            withPadding='horizontal'
          />
        </BubbleContent>
      )}
    </BubbleMenuTooltip>
  );
};

const Input = styled.input`
  border: none;
  outline: none;
  color: white;
  background-color: transparent;
  min-width: 150px;
  padding: 0 10px;
`;

interface LinkInputProps extends Pick<BubbleMenuProps, 'deactivateLink'> {
  updateLink(href: string): void;
  removeLink(): void;
  canRemove(): boolean;
}

const LinkInput: FC<LinkInputProps> = ({ deactivateLink, updateLink, removeLink, canRemove }) => {
  const [href, setHref] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = event => {
    setHref(event.target.value);
  };

  const submitLink = () => {
    updateLink(href);
    deactivateLink();
  };

  const onKeyPress: KeyboardEventHandler<HTMLInputElement> = event => {
    if (keyCode.isEventKey(event.nativeEvent, 'esc')) {
      event.preventDefault();
      deactivateLink();
    }

    if (keyCode.isEventKey(event.nativeEvent, 'enter')) {
      event.preventDefault();
      submitLink();
    }
  };

  const onClickRemoveLink: DOMAttributes<HTMLButtonElement>['onClick'] = event => {
    event.preventDefault();
    removeLink();
    deactivateLink();
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  });

  const handleClick = (event: MouseEvent) => {
    if (!wrapperRef.current || wrapperRef.current.contains(event.target as Node)) {
      return;
    }
    deactivateLink();
  };

  return (
    <BubbleContent ref={wrapperRef}>
      <Input
        placeholder='Enter URL...'
        autoFocus={true}
        onChange={onChange}
        // onBlur={deactivateLink}
        onSubmit={submitLink}
        onKeyPress={onKeyPress}
      />
      {canRemove() && (
        <MenuItem
          icon={faTimes}
          state='active-inverse'
          onClick={onClickRemoveLink}
          inverse={true}
          withPadding='horizontal'
        />
      )}
    </BubbleContent>
  );
};
