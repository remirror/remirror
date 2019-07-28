import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { styled } from '../wysiwyg-theme';
import { ButtonProps } from '../wysiwyg-types';

export const Menu = styled.div`
  & > button {
    display: inline-block;
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

export interface WithPaddingProps {
  withPadding: 'horizontal' | 'right';
}

interface IconButtonProps extends ButtonProps, Partial<WithPaddingProps> {
  /**
   * The position in the menu
   */
  index?: number;
}

export const IconButton = styled(ResetButton)<IconButtonProps>`
  color: ${({ state, theme }) => theme.button.color[state]};
  margin-left: ${props => (props.index !== 0 ? '15px' : null)};
  padding: ${({ withPadding }) =>
    withPadding === 'horizontal' ? '0 10px' : withPadding === 'right' ? '0 10px 0 0' : 0};
`;

export const InnerEditorWrapper = styled.div`
  height: 100%;

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

/**
 * Allows positioners to work.
 */
export const EditorWrapper = styled.div`
  /* border: 1px solid grey; */
  position: relative;
`;

export const BubbleMenuTooltip = styled.span<{ bottom: number; left: number }>`
  /* Required to make the element clickable */
  z-index: 10;
  position: absolute;
  bottom: ${props => props.bottom}px;
  left: ${props => props.left}px;
  padding-bottom: 9px;
  transform: translateX(-50%);

  &::after {
    content: '';
    position: absolute;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 9px solid black;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const BubbleContent = styled.span`
  background: black;
  border-radius: 3px;
  color: white;
  font-size: 0.75rem;
  line-height: 1.4;
  padding: 0.75em;
  text-align: center;
  display: flex;
`;
