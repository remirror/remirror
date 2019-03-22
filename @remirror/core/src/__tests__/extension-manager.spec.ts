import { Schema } from 'prosemirror-model';
import { Extension } from '../extension';
import { ExtensionManager } from '../extension-manager';
import { Cast } from '../helpers/base';
import { Doc, Paragraph, Text } from '../nodes';

export const helpers = {
  getEditorState: Cast(jest.fn(() => 'state')),
  getPortalContainer: Cast(jest.fn(() => 'portals')),
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

const em = ExtensionManager.create([
  { extension: doc, priority: 2 },
  { extension: text, priority: 2 },
  { extension: paragraph, priority: 2 },
  { extension: dummy, priority: 2 },
]);

em.init(helpers);

test('ExtensionManager#properties', () => {
  expect(em).toBeInstanceOf(ExtensionManager);
  expect(em.extensions).toHaveLength(4);
  expect(em.getEditorState()).toBe('state');
  expect(em.getPortalContainer()).toBe('portals');
});

const schema = new Schema({
  nodes: em.nodes,
  marks: em.marks,
});

test('ExtensionManager#nodes', () => {
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
    expect(mock).toHaveBeenCalledWith(params.view.state, params.view.dispatch, params.view);
  });

  it('is not called when the editor is not editable', () => {
    params = { ...params, isEditable: () => false };
    remirrorActions.dummy.command();
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
