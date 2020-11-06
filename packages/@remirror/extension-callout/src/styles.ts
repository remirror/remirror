import { css } from 'linaria';

export const editorStyles = css`
  div[data-callout-type] {
    border-left: 2px solid transparent;
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
  }

  div[data-callout-type='info'] {
    background: #eef6fc;
    border-left-color: #3298dc;
  }

  div[data-callout-type='warning'] {
    background: #fffbeb;
    border-left-color: #ffdd57;
  }

  div[data-callout-type='error'] {
    background: #feecf0;
    border-left-color: #f14668;
  }

  div[data-callout-type='success'] {
    background: #effaf3;
    border-left-color: #48c774;
  }
`;
