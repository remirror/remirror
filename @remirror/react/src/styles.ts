import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { css } from '@remirror/react-utils';

export interface PlaceholderContent {
  selector: string;
  content: string;
}

export const defaultStyles = css`
  ${EDITOR_CLASS_SELECTOR} {
    caret-color: currentColor;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  ${EDITOR_CLASS_SELECTOR}:focus {
    outline: none;
  }

  ${EDITOR_CLASS_SELECTOR}${'[contenteditable="false"]'} {
    white-space: normal;
  }

  ${EDITOR_CLASS_SELECTOR}${'[contenteditable="true"]'} {
    white-space: pre-wrap;
  }
`;
