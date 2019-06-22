import { createTestManager, extensions } from '@test-fixtures/schema-helpers';
import { EditorView } from 'prosemirror-view';
import { EMPTY_PARAGRAPH_NODE } from '../constants';
import { Extension } from '../extension';
import { ExtensionManager, isExtensionManager } from '../extension-manager';
import { Cast } from '../helpers/base';
import { NodeViewPortalContainer } from '../portal-container';
import { EditorState } from '../types';

export const helpers = {
  getEditorState: Cast(jest.fn(() => state)),
  getPortalContainer: Cast(jest.fn(() => portalContainer)),
};

const innerMock = jest.fn();
const mock = jest.fn(() => innerMock);

class DummyMark extends Extension {
  public name = 'dummy';
  public commands() {
    // console.log('commands being called', params);
    return mock;
  }
}

let dummy: DummyMark;
let manager: ExtensionManager;
let state: EditorState;
let view: EditorView;
let portalContainer: NodeViewPortalContainer;

beforeEach(() => {
  portalContainer = new NodeViewPortalContainer();
  dummy = new DummyMark();
  manager = ExtensionManager.create([...extensions, { extension: dummy, priority: 1 }]);
  manager.init(helpers);
  state = manager.createState({ content: EMPTY_PARAGRAPH_NODE });
  view = new EditorView(document.createElement('div'), {
    state,
    editable: () => true,
  });
  manager.initView(view);
});

test('commands', () => {
  const attrs = { a: 'a' };
  manager.data.actions.dummy.command(attrs);
  expect(mock).toHaveBeenCalledWith(attrs);
  expect(innerMock).toHaveBeenCalledWith(state, view.dispatch, view);
});

describe('#properties', () => {
  it('should sort extensions by priority', () => {
    expect(manager.extensions).toHaveLength(10);
    expect(manager.extensions[0]).toEqual(dummy);
  });

  it('should throw if data accessed without init', () => {
    createTestManager();
  });
});

test('isExtensionManager', () => {
  expect(isExtensionManager({})).toBeFalse();
  expect(isExtensionManager(manager)).toBeTrue();
});
