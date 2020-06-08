import { css } from 'linaria';

export const emojiSuggestionsItemStyles = css`
  padding: 8px;
  text-overflow: ellipsis;
  max-width: 250px;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  color: white;
  &.hovered {
    color: hsl(205, 5%, 90%);
  }

  &.highlighted {
    color: hsl(205, 5%, 80%);
  }
`;

export const emojiSuggestionsDropdownWrapperStyles = css`
  position: absolute;
  width: max-content;
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: hsla(205, 70%, 15%, 0.25) 0 4px 8px -2px 0px, hsla(205, 70%, 15%, 0.31) 0px 0px 1px;
  z-index: 10;
  max-height: 250px;
  overflow-y: scroll;
`;

export const mentionSuggestionsDropdownWrapperStyles = css`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  flex-basis: auto;
  flex-shrink: 0px;
  margin: 0px;
  overflow: hidden;
  list-style: none;
  padding: 0px;
`;

export const mentionSuggestionsItemStyles = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid rgb(230, 236, 240);
  padding: 7px 15px 6px 10px;
  font-size: 14px;
  color: white;

  &.hovered {
    color: hsl(205, 5%, 90%);
  }

  &.highlighted {
    color: hsl(205, 5%, 80%);
  }

  &:hover {
    background-color: #e8f5fd;
  }

  &:hover span {
    color: #1da1f2;
  }
`;

export const mentionSuggestionsUserItemImageStyles = css`
  width: 32px;
  height: 32px;
  margin-right: 10px;
  border-radius: 50%;
`;

export const mentionSuggestionsUserItemDisplayNameStyles = css`
  margin-right: 5px;
  color: #14171a;
  word-break: break-all;
  font-weight: bold;
`;

export const mentionSuggestionsUserItemUsernameStyles = css`
  color: #657786;
`;

export const mentionSuggestionsTagItemTagStyles = css`
  font-weight: bold;
  color: #66757f;

  &:hover {
    text-decoration: underline;
    color: #1da1f2;
  }
`;
