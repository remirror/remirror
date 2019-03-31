import { EDITOR_CLASS_NAME } from '@remirror/core';
import { styled } from '../theme';

const editorClass = `.${EDITOR_CLASS_NAME}`;

export const InnerEditorWrapper = styled.div`
  height: 100%;
  & * {
    box-sizing: border-box;
  }

  ${editorClass}:focus {
    outline: none;
  }

  ${editorClass} p {
    margin: 0;
    letter-spacing: 0.6px;
    color: black;
  }

  ${editorClass} {
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

  ${editorClass} a {
    text-decoration: none !important;
    color: ${props => props.theme.colors.primary};
  }

  ${editorClass} a.mention {
    pointer-events: none;
    cursor: default;
  }

  ${editorClass} .ProseMirror-selectednode {
    background-color: rgb(245, 248, 250);
  }
`;
