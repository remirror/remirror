import { EditorView } from '@remirror/pm/view';

import { EditorManager } from '@remirror/core';

export const injectedPropsShape = {
  view: expect.any(EditorView),
  manager: expect.any(EditorManager),
  actions: expect.any(Object),
  uid: expect.any(String),
  clearContent: expect.any(Function),
  setContent: expect.any(Function),
  getRootProps: expect.any(Function),
  getPositionerProps: expect.any(Function),
};

export const positionerShape = {
  isActive: expect.any(Boolean),
  top: expect.any(Number),
  left: expect.any(Number),
  bottom: expect.any(Number),
  right: expect.any(Number),
  ref: expect.any(Function),
};
