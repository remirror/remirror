import { Schema } from 'prosemirror-model';
import { Extension } from '../extension';
import { ExtensionManager } from '../extension-manager';
import { Cast } from '../helpers';
import { Doc, Paragraph, Text } from '../nodes';

const state = {
  editorState: Cast({}),
};

const mock = jest.fn();

class DummyMark extends Extension {
  public name = 'dummy';
  public commands() {
    return () => {
      return mock;
    };
  }
}

const doc = new Doc();
const text = new Text();
const paragraph = new Paragraph();
const dummy = new DummyMark();

const em = new ExtensionManager([doc, text, paragraph, dummy], () => state.editorState, () => Cast({}));
test('-properties', () => {
  expect(em).toBeInstanceOf(ExtensionManager);
  expect(em.extensions).toHaveLength(4);
  expect(em.getEditorState()).toBe(state.editorState);
});

const schema = new Schema({
  nodes: em.nodes,
  marks: em.marks,
});

test('-nodes', () => {
  expect(schema.nodes.doc.spec).toEqual(doc.schema);
  expect(schema.nodes.text.spec).toEqual(text.schema);
});

describe('#action', () => {
  let params = {
    schema,
    isEditable: () => true,
    view: {
      focus: jest.fn(),
      state: {},
      dispatch: jest.fn(),
    },
  };
  const remirrorActions = em.actions(Cast(params));
  it('calls the correct command', () => {
    expect(remirrorActions.dummy).toContainAllKeys(['isActive', 'isEnabled', 'command']);
    remirrorActions.dummy.command();
    expect(mock).toHaveBeenCalledWith(params.view.state, params.view.dispatch);
  });

  it('is not called when the editor is not editable', () => {
    params = { ...params, isEditable: () => false };
    remirrorActions.dummy.command();
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
