import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { styled } from '../theme';

/* Styled Components */

export const CharacterCountWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0 8px 10px 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const EmojiSmileyWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px 8px 0 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const EmojiPickerWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 40px 8px 0 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const RemirrorWrapper = styled.div`
  height: 100%;
  & * {
    box-sizing: border-box;
  }

  ${EDITOR_CLASS_SELECTOR}:focus {
    outline: none;
  }

  ${EDITOR_CLASS_SELECTOR} p {
    margin: 0;
    letter-spacing: 0.6px;
    color: black;
  }

  ${EDITOR_CLASS_SELECTOR} {
    box-sizing: border-box;
    position: relative;
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
    line-height: 20px;
    border-radius: 8px;
    width: 100%;
    font-family: ${({ theme }) => theme.font.family};
    font-size: ${({ theme }) => theme.font.size};
    max-height: calc(90vh - 124px);
    min-height: 142px;
    padding: 8px;
    padding-right: 40px;
    font-weight: ${({ theme }) => theme.font.weight};
  }

  ${EDITOR_CLASS_SELECTOR} a {
    text-decoration: none !important;
    color: ${props => props.theme.colors.primary};
  }

  ${EDITOR_CLASS_SELECTOR} a.mention {
    pointer-events: none;
    cursor: default;
  }

  ${EDITOR_CLASS_SELECTOR} .ProseMirror-selectednode {
    background-color: rgb(245, 248, 250);
  }
`;
