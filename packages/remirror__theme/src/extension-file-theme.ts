import { css } from '@linaria/core';

export const FILE_ROOT = css`
  border-radius: 4px;
  padding: 8px 12px;
  background-color: #e8ecf1;
  color: #000;
  margin: 8px auto;
  min-height: 32px;
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
` as 'remirror-file-root';

export const FILE_NAME = css`
  font-size: 1rem;
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
` as 'remirror-file-name';

export const FILE_SIZE = css`
  font-size: 0.8rem;
  margin-left: 8px;
  color: gray;
  white-space: nowrap;
` as 'remirror-file-size';

export const FILE_UPLOAD_PROGRESS = css`
  font-size: 0.8rem;
  margin-left: 8px;
  margin-right: 8px;
  color: gray;
  font-family: Menlo, Monaco, 'Courier New', monospace;
` as 'remirror-file-upload-progress';

export const FILE_ERROR = css`
  font-size: 0.8rem;
  color: red;
` as 'remirror-file-error';

export const FILE_ICON_BUTTON = css`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
` as 'remirror-file-icon-button';
