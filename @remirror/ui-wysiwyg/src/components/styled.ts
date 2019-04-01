import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { styled } from '../theme';

export const InnerEditorWrapper = styled.div`
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
    border: 0.1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
    line-height: 1.6em;
    width: 100%;
    font-family: ${({ theme }) => theme.font.family};
    font-size: ${({ theme }) => theme.font.size};
    /* max-height: calc(90vh - 124px); */
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
