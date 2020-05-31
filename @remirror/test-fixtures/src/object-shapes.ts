import { EditorManager } from '@remirror/core';
import { EditorView } from '@remirror/pm/view';

export const contextPropsShape = {
  view: expect.any(EditorView),
  manager: expect.any(EditorManager),
  commands: expect.any(Object),
  uid: expect.any(String),
  clearContent: expect.any(Function),
  setContent: expect.any(Function),
  getRootProps: expect.any(Function),
  getPositionerProps: expect.any(Function),
};

export const positionerShape = {
  active: expect.any(Boolean),
  ref: expect.any(Function),
};
