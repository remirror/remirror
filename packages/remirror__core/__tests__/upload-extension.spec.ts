import { extensionValidityTest, renderEditor } from 'jest-remirror';

import {
  ActionType,
  DecorationsExtension,
  findUploadPlaceholderPayload,
  hasUploadingFile,
  setUploadPlaceholderAction,
  uniqueId,
} from '..';

extensionValidityTest(DecorationsExtension);

test('add single placeholder', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
    dom,
  } = editor;
  const id = uniqueId('file-placeholder-');
  const { state } = add(doc(p('upload<cursor> placeholder')));
  const tr = setUploadPlaceholderAction(state.tr, {
    id,
    pos: state.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });
  view.dispatch(tr);

  expect(dom.outerHTML).toMatchSnapshot();
});

test('add multiple placeholder', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
    dom,
  } = editor;
  const id1 = uniqueId('file-placeholder-id1');
  const id2 = uniqueId('file-placeholder-id2');
  const { tr } = add(doc(p('upload<cursor> placeholder')));

  setUploadPlaceholderAction(tr, {
    id: id1,
    pos: tr.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });

  setUploadPlaceholderAction(tr, {
    id: id2,
    pos: tr.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });

  view.dispatch(tr);

  expect(dom.outerHTML).toMatchSnapshot();
});

test('remove single placeholder', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
    dom,
  } = editor;
  const id1 = uniqueId('file-placeholder-');
  const { tr } = add(doc(p('upload<cursor> placeholder')));

  setUploadPlaceholderAction(tr, {
    id: id1,
    pos: tr.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });

  view.dispatch(tr);

  const newTr = view.state.tr;
  setUploadPlaceholderAction(newTr, {
    id: id1,
    type: ActionType.REMOVE_PLACEHOLDER,
  });
  view.dispatch(newTr);

  expect(dom.outerHTML).toMatchSnapshot();
});

test('remove multiple placeholder', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
    dom,
  } = editor;
  const id1 = uniqueId('file-placeholder-');
  const id2 = uniqueId('file-placeholder-');
  const { tr } = add(doc(p('upload<cursor> placeholder')));

  setUploadPlaceholderAction(tr, {
    id: id1,
    pos: tr.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });

  setUploadPlaceholderAction(tr, {
    id: id2,
    pos: tr.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });

  view.dispatch(tr);

  const newTr = view.state.tr;

  setUploadPlaceholderAction(newTr, {
    id: id1,
    type: ActionType.REMOVE_PLACEHOLDER,
  });

  setUploadPlaceholderAction(newTr, {
    id: id2,
    type: ActionType.REMOVE_PLACEHOLDER,
  });
  view.dispatch(newTr);

  expect(dom.outerHTML).toMatchSnapshot();
});

test('hasUploadingFile function', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
  } = editor;
  const id = uniqueId('file-placeholder-');
  const { state } = add(doc(p('upload<cursor> placeholder')));
  const tr = setUploadPlaceholderAction(state.tr, {
    id,
    pos: state.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: null,
  });
  view.dispatch(tr);

  const flag = hasUploadingFile(view.state);

  expect(flag).toBeTrue();
});

test('findUploadPlaceholderPayload function', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
  } = editor;
  const id = uniqueId('file-placeholder-');
  const { state } = add(doc(p('upload<cursor> placeholder')));
  const tr = setUploadPlaceholderAction(state.tr, {
    id,
    pos: state.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: { a: 1, b: 2 },
  });
  view.dispatch(tr);

  const payload = findUploadPlaceholderPayload(view.state, id);

  expect(payload).toEqual({ a: 1, b: 2 });
});

test('update placeholder', () => {
  const editor = renderEditor<never>([]);
  const {
    nodes: { doc, p },
    add,
    view,
  } = editor;
  const id = uniqueId('file-placeholder-');
  const { state } = add(doc(p('upload<cursor> placeholder')));
  const tr = setUploadPlaceholderAction(state.tr, {
    id,
    pos: state.selection.from,
    type: ActionType.ADD_PLACEHOLDER,
    payload: { a: 1, b: 2 },
  });

  setUploadPlaceholderAction(tr, {
    id,
    type: ActionType.UPDATE_PLACEHOLDER,
    payload: { c: 3, d: 4 },
  });
  view.dispatch(tr);

  const payload = findUploadPlaceholderPayload(view.state, id);

  expect(payload).toEqual({ c: 3, d: 4 });
});
