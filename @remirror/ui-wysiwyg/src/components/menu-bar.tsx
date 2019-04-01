import React, { DOMAttributes, FC, MouseEventHandler } from 'react';

import {
  faBold,
  faCode,
  faGripLines,
  faHeading,
  faItalic,
  faList,
  faListOl,
  faQuoteRight,
  faRedoAlt,
  faStrikethrough,
  faUnderline,
  faUndoAlt,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Attrs, memoize } from '@remirror/core';
import { useRemirrorContext } from '@remirror/react';
import { ButtonState } from '../theme';
import { IconButton, Toolbar } from './styled';

const menuItems: Array<[string, [IconDefinition, string?], Attrs?]> = [
  ['bold', [faBold]],
  ['italic', [faItalic]],
  ['underline', [faUnderline]],
  ['strike', [faStrikethrough]],
  ['heading', [faHeading, '1'], { level: 1 }],
  ['heading', [faHeading, '2'], { level: 2 }],
  ['heading', [faHeading, '3'], { level: 3 }],
  ['undo', [faUndoAlt]],
  ['redo', [faRedoAlt]],
  ['bulletList', [faList]],
  ['orderedList', [faListOl]],
  ['blockquote', [faQuoteRight]],
  ['codeBlock', [faCode]],
  ['horizontalRule', [faGripLines]],
];

const runAction = memoize(
  (method: (attrs?: Attrs) => void, attrs?: Attrs): MouseEventHandler<HTMLElement> => e => {
    e.preventDefault();
    method(attrs);
  },
);

const getButtonState = (active: boolean, inverse = false): ButtonState =>
  active ? (inverse ? 'active-inverse' : 'active-default') : inverse ? 'inverse' : 'default';

interface MenuBarProps {
  inverse?: boolean;
}

export const MenuBar: FC<MenuBarProps> = ({ inverse }) => {
  const { actions } = useRemirrorContext();

  return (
    <Toolbar>
      {menuItems.map(([name, [icon, subText], attrs], index) => {
        const buttonState = getButtonState(actions[name].isActive(attrs), inverse);

        return (
          <MenuItem
            key={index}
            icon={icon}
            subText={subText}
            state={buttonState}
            disabled={!actions[name].isEnabled()}
            onMouseDown={runAction(actions[name].command, attrs)}
          />
        );
      })}
    </Toolbar>
  );
};

interface MenuItemProps {
  state: ButtonState;
  onMouseDown: DOMAttributes<HTMLButtonElement>['onMouseDown'];
  icon: IconDefinition;
  inverse?: boolean;
  disabled?: boolean;
  subText?: string;
}

const MenuItem: FC<MenuItemProps> = ({
  state,
  onMouseDown,
  icon,
  inverse = false,
  disabled = false,
  subText,
}) => {
  return (
    <IconButton onMouseDown={onMouseDown} state={state} disabled={disabled}>
      <FontAwesomeIcon icon={icon} inverse={inverse} />
      {subText}
    </IconButton>
  );
};

// A code block.
// Press Shift-Enter or Cmd-Enter to exit
