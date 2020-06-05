import { css } from 'linaria';

export const coreStyles = css`
  .is-empty:first-of-type::before {
    position: absolute;
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
    content: attr(data-placeholder);
  }
`;
