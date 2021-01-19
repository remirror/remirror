import { css } from '@linaria/core';

import { getTheme } from './utils';

const foreground = getTheme((t) => t.color.foreground);
const text = getTheme((t) => t.color.text);
const background = getTheme((t) => t.color.background);
const backdrop = getTheme((t) => t.color.backdrop);
const border = getTheme((t) => t.color.border);
const shadow1 = getTheme((t) => t.color.shadow1);
const borderHover = getTheme((t) => t.color.hover.border);
const borderActive = getTheme((t) => t.color.active.border);
const primary = getTheme((t) => t.color.primary);
const primaryText = getTheme((t) => t.color.primaryText);
const primaryHover = getTheme((t) => t.color.hover.primary);
const primaryHoverText = getTheme((t) => t.color.hover.primaryText);
const primaryActive = getTheme((t) => t.color.active.primary);
const primaryActiveText = getTheme((t) => t.color.active.primaryText);

export const EDITOR_WRAPPER = css`
  padding-top: ${getTheme((t) => t.space[3])};
`;

export const BUTTON_ACTIVE = css`
  color: ${primaryText};
  background-color: ${primary};
`;

export const BUTTON = css`
  display: inline-flex;
  font-weight: 400;
  align-items: center;
  justify-content: center;
  user-select: none;
  padding: 0.375em 0.75em;
  line-height: 1.5;
  border-radius: ${getTheme((t) => t.radius.border)};
  text-decoration: none;
  border: 1px solid ${border};
  cursor: pointer;
  white-space: nowrap;
  color: ${text};
  background-color: ${background};
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  font-size: 100%;
  &[aria-disabled='true'] {
    cursor: auto;
  }
  &:not([aria-disabled='true']) {
    &:hover {
      color: ${primaryHoverText};
      border-color: ${borderHover};
      background-color: ${primaryHover};
    }
    &:active,
    &[data-active],
    &[aria-expanded='true'] {
      color: ${primaryActiveText};
      border-color: ${borderActive};
      background-color: ${primaryActive};
    }
  }

  /* Ensure a perceivable button border for users with Windows High Contrast
  mode enabled https://moderncss.dev/css-button-styling-guide/ */
  @media screen and (-ms-high-contrast: active) {
    border: 2px solid currentcolor;
  }
` as 'remirror-button';

export const COMPOSITE = css`
  align-items: center;
  justify-content: center;
  padding: 0.375em 0.75em;
  font-size: 100%;
  border: 0;
  color: inherit;
  background-color: inherit;
  &:not([aria-selected='true']) {
    color: inherit;
    background-color: inherit;
  }
  [aria-activedescendant='*']:focus &[aria-selected='true'],
  [aria-activedescendant='*']:focus ~ * &[aria-selected='true'] {
    color: ${text};
    background-color: ${background};
  }
` as 'remirror-composite';

export const DIALOG = css`
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: ${getTheme((t) => t.radius.border)};
  padding: 1em;
  max-height: calc(100vh - 56px);
  outline: 0;
  border: 1px solid ${border};
  color: ${text};
  z-index: 999;

  &:focus {
    box-shadow: 0 0 0 0.2em ${shadow1};
  }
` as 'remirror-dialog';

export const DIALOG_BACKDROP = css`
  background-color: ${backdrop};
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
` as 'remirror-dialog-backdrop';

export const FORM = css`
  > *:not(:first-child) {
    margin-top: 1rem;
  }
` as 'remirror-form';

export const FORM_MESSAGE = css`
  font-size: 0.8em;
  margin-top: 0.5rem !important;
` as 'remirror-form-message';

export const FORM_LABEL = css`
  display: block;
  margin: 0 0 0.5rem 0 !important;

  input[type='checkbox'] + &,
  input[type='radio'] + & {
    display: inline-block;
    margin: 0 0 0 0.5rem !important;
  }
` as 'remirror-form-label';

export const FORM_GROUP = css`
  display: block;
  color: ${text};
  border: 1px solid ${border};
  border-radius: ${getTheme((t) => t.radius.border)};
  padding: 0.5rem 1rem 1rem;
  & > * {
    display: block;
  }
` as 'remirror-form-group';

export const GROUP = css`
  display: flex;

  & > :not(:first-child) {
    margin-left: -1px;
  }

  & > :not(:first-child):not(:last-child):not(.first-child):not(.last-child) {
    border-radius: 0;
  }

  & > :first-child:not(:last-child),
  & > .first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  & > :last-child:not(:first-child),
  & > .last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
` as 'remirror-group';

export const INPUT = css`
  display: block;
  width: 100%;
  border-radius: ${getTheme((t) => t.radius.border)};
  padding: 0.5em 0.75em;
  font-size: 100%;
  border: 1px solid ${getTheme((t) => t.hue.gray[2])};
  color: ${getTheme((t) => t.hue.gray[5])};
  margin: 0 !important;

  &:focus {
    border-color: ${getTheme((t) => t.hue.gray[3])};
  }
`;

export const MENU = css`
  display: flex;
  border-radius: 0;
` as 'remirror-menu';

export const MENU_PANE = css`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: ${getTheme((t) => t.space[1])};
  padding-bottom: ${getTheme((t) => t.space[1])};
  padding-right: ${getTheme((t) => t.space[2])};
`;

export const MENU_PANE_ACTIVE = css`
  color: ${primaryText};
  background-color: ${primary};
`;

export const MENU_DROPDOWN_LABEL = css`
  padding: 0 ${getTheme((t) => t.space[2])};
`;

export const MENU_PANE_ICON = css`
  position: absolute;
  left: 8px;
  width: 20px;
  color: ${getTheme((t) => t.hue.gray[7])};

  button:hover &,
  button:active &,
  [aria-checked='true'] & {
    color: ${getTheme((t) => t.hue.gray[1])};
  }
`;

export const MENU_PANE_LABEL = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: ${getTheme((t) => t.space[3])};
`;

export const MENU_PANE_SHORTCUT = css`
  align-self: flex-end;
  color: ${getTheme((t) => t.hue.gray[6])};

  button:hover &,
  button:active &,
  [aria-checked='true'] & {
    color: ${getTheme((t) => t.hue.gray[1])};
  }
`;

export const MENU_BUTTON_LEFT = css`
  [role='menu'] > & {
    left: ${getTheme((t) => t.space[2])};
  }
` as 'remirror-menu-button-left';
export const MENU_BUTTON_RIGHT = css`
  [role='menu'] > & {
    right: ${getTheme((t) => t.space[2])};
  }
` as 'remirror-menu-button-right';

export const MENU_BUTTON_NESTED_LEFT = css`
  svg {
    margin-right: ${getTheme((t) => t.space[2])};
  }
` as 'remirror-menu-button-nested-left';

export const MENU_BUTTON_NESTED_RIGHT = css`
  [role='menu'] > & {
    padding-right: 2em !important;
  }

  svg {
    margin-left: ${getTheme((t) => t.space[2])};
  }
` as 'remirror-menu-button-nested-right';

export const MENU_BUTTON = css`
  position: relative;

  svg {
    fill: currentColor;
    width: 0.65em;
    height: 0.65em;

    [role='menu'] > & {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    [role='menubar'] > & {
      display: none;
    }
  }
` as 'remirror-menu-button';

export const MENU_BAR = css`
  position: relative;
  display: flex;
  white-space: nowrap;
  box-shadow: none !important;

  &[aria-orientation='vertical'] {
    padding: 0.25em 0;
  }

  &[aria-orientation='horizontal'] {
    padding: 0;
  }
` as 'remirror-menu-bar';

export const FLEX_COLUMN = css`
  flex-direction: column;
` as `remirror-flex-column`;

export const FLEX_ROW = css`
  flex-direction: row;
` as `remirror-flex-row`;

export const MENU_ITEM = css`
  line-height: 1.5;
  text-align: left;
  justify-content: flex-start;
  border: 0;
  border-radius: 0;
  font-size: 100%;
  background: transparent;
  color: ${foreground};
  margin: 0;
  user-select: none;
  cursor: default;
  text-decoration: none;

  &:focus,
  &[aria-expanded='true'] {
    background-color: ${primary};
    color: ${primaryText};
    box-shadow: none !important;
  }

  &:active,
  &[data-active] {
    background-color: ${primaryActive} !important;
    color: ${primaryActiveText} !important;
  }
`;

export const MENU_ITEM_ROW = css`
  padding: 0 ${getTheme((t) => t.space[2])};
`;

export const MENU_ITEM_COLUMN = css`
  padding: 0 ${getTheme((t) => t.space[4])};
`;

export const MENU_ITEM_CHECKBOX = css`
  position: relative;
  outline: 0;

  &[aria-checked='true'] {
    &:before {
      content: '✓';
      position: absolute;
      top: 0;
      left: 0.4em;
      width: 1em;
      height: 1em;
    }
  }
` as 'remirror-menu-item-checkbox';

export const MENU_ITEM_RADIO = css`
  position: relative;
  outline: 0;

  &[aria-checked='true'] {
    &:before {
      content: '•';
      position: absolute;
      font-size: 1.4em;
      top: -0.25em;
      left: 0.35em;
      width: 0.7142857143em;
      height: 0.7142857143em;
    }
  }
` as 'remirror-menu-item-radio';

export const MENU_GROUP = css`
  display: inherit;
  flex-direction: inherit;
` as 'remirror-menu-group';

export const FLOATING_POPOVER = css`
  /* padding: ${getTheme((t) => t.space[2])}; */
  padding: 0;
  border: none;
  max-height: calc(100vh - 56px);
`;

export const POPOVER = css`
  [data-arrow] {
    background-color: transparent;
    & .stroke {
      fill: ${border};
    }
    & .fill {
      fill: ${background};
    }
  }
` as 'remirror-popover';

export const ANIMATED_POPOVER = css`
  transition: opacity 250ms ease-in-out, transform 250ms ease-in-out;
  opacity: 0;
  transform-origin: top center;
  transform: translate3d(0, -20px, 0);
  [data-enter] & {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const ROLE = css`
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-family: ${getTheme((t) => t.fontFamily.default)};
  color: ${text};
  background-color: ${background};
  /* border: 1px solid ${border}; */
`;

export const SEPARATOR = css`
  border: 1px solid ${border};
  border-width: 0 1px 0 0;
  margin: 0 0.5em;
  padding: 0;
  width: 0;
  height: auto;
  &[aria-orientation='horizontal'] {
    border-width: 0 0 1px 0;
    margin: 0.5em 0;
    width: auto;
    height: 0;
  }
`;

export const TAB = css`
  background-color: transparent;
  border: 1px solid transparent;
  border-width: 1px 1px 0 1px;
  border-radius: ${getTheme((t) => t.radius.border)} ${getTheme((t) => t.radius.border)} 0 0;
  font-size: 100%;
  padding: 0.5em 1em;
  margin: 0 0 -1px 0;
  &[aria-selected='true'] {
    background-color: ${background};
    border-color: ${border};
  }
  [aria-orientation='vertical'] & {
    border-width: 1px 0 1px 1px;
    border-radius: 0.2em 0 0 0.2em;
    margin: 0 -1px 0 0;
  }
` as 'remirror-tab';

export const TAB_LIST = css`
  display: flex;
  flex-direction: row;
  border: 1px solid ${border};
  border-width: 0 0 1px 0;
  margin: 0 0 1em 0;
  &[aria-orientation='vertical'] {
    flex-direction: column;
    border-width: 0 1px 0 0;
    margin: 0 1em 0 0;
  }
` as 'remirror-tab-list';

export const TABBABLE = css`
  &:not([type='checkbox']):not([type='radio']) {
    /* transition: box-shadow 0.15s ease-in-out; */
    outline: 0;
    &:focus {
      box-shadow: ${getTheme((t) => t.color.outline)} 0px 0px 0px 0.2em;
      position: relative;
      z-index: 2;
    }
    &:hover {
      z-index: 2;
    }
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
  }
`;

export const TOOLBAR = css`
  display: flex;
  flex-direction: row;

  & > *:not(:first-child) {
    margin: 0 0 0 0.5em;
  }

  &[aria-orientation='vertical'] {
    display: inline-flex;
    flex-direction: column;

    & > *:not(:first-child) {
      margin: 0.5em 0 0;
    }
  }
`;

export const TOOLTIP = css`
  background-color: ${getTheme((t) => t.color.faded)};
  color: white;
  font-size: 0.8em;
  padding: 0.5rem;
  border-radius: ${getTheme((t) => t.radius.border)};
  z-index: 999;

  [data-arrow] {
    background-color: transparent;
    & .stroke {
      fill: transparent;
    }
    & .fill {
      fill: ${getTheme((t) => t.hue.gray[8])};
    }
  }
`;

export const TABLE_SIZE_EDITOR = css`
  background: ${getTheme((t) => t.color.background)};
  box-shadow: ${getTheme((t) => t.color.shadow1)};
  font-family: ${getTheme((t) => t.fontFamily.default)};
  font-size: ${getTheme((t) => t.fontSize[1])};
`;

export const TABLE_SIZE_EDITOR_BODY = css`
  position: relative;

  &::after {
    background: rgba(0, 0, 0, 0);
    bottom: -50px;
    content: '';
    left: 0;
    position: absolute;
    right: -50px;
    top: -50px;
  }
`;

export const TABLE_SIZE_EDITOR_CELL = css`
  border: ${getTheme((t) => t.color.border)};
  position: absolute;
  z-index: 2;
`;

export const TABLE_SIZE_EDITOR_CELL_SELECTED = css`
  background: ${getTheme((t) => t.color.selection.background)};
  border-color: ${getTheme((t) => t.color.border)};
`;

export const TABLE_SIZE_EDITOR_FOOTER = css`
  padding-bottom: ${getTheme((t) => t.space['1'])};
  text-align: center;
`;

export const COLOR_PICKER = css`
  background: ${getTheme((t) => t.color.background)};
  box-shadow: ${getTheme((t) => t.boxShadow[1])};
  font-family: ${getTheme((t) => t.fontFamily.default)};
  font-size: ${getTheme((t) => t.fontSize[1])};
  padding: ${getTheme((t) => t.space[2])} ${getTheme((t) => t.space[3])};
`;
export const COLOR_PICKER_CELL = css``;
export const COLOR_PICKER_CELL_SELECTED = css``;
