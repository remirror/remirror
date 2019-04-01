import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { styled } from '../theme';
import { ButtonProps } from '../types';

export const Menu = styled.div`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;

export const Toolbar = styled(Menu)`
  position: relative;
  padding: 1px 28px 17px;
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`;

const ResetButton = styled.button`
  padding: 0;
  border: none;
  font: inherit;
  color: inherit;
  background-color: transparent;
  outline: none;
  cursor: pointer;
`;

export const IconButton = styled(ResetButton)<ButtonProps>`
  color: ${({ state, theme }) => theme.button.color[state]};
  padding-right: 10px;
`;

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

  p em {
    letter-spacing: 1.2px;
  }

  ${EDITOR_CLASS_SELECTOR} {
    box-sizing: border-box;
    position: relative;
    /* border: 0.1px solid ${({ theme }) => theme.colors.border}; */
    /* box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border}; */
    line-height: 1.6em;
    width: 100%;
    font-size: ${({ theme }) => theme.font.size};
    /* max-height: calc(90vh - 124px); */
    min-height: 142px;
    padding: 10px;
    padding-right: 0;
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

export const EditorWrapper = styled.div`
  /* border: 1px solid grey; */
`;
