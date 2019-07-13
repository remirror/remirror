import { createTestManager, extensions } from '@test-fixtures/schema-helpers';
import { EditorView } from 'prosemirror-view';
import React, { FC } from 'react';
import { EMPTY_PARAGRAPH_NODE } from '../constants';
import { Extension } from '../extension';
import { ExtensionManager, isExtensionManager } from '../extension-manager';
import { Cast } from '../helpers/base';
import { NodeExtension } from '../node-extension';
import { NodeViewPortalContainer } from '../portal-container';
import { Attrs, EditorState, NodeExtensionSpec } from '../types';

export const helpers = {
  getState: Cast(jest.fn(() => state)),
  portalContainer: new NodeViewPortalContainer(),
};

const innerMock = jest.fn();
const mock = jest.fn(() => innerMock);

const SSRComponent: FC<Attrs> = () => <div />;

class DummyExtension extends Extension {
  public name = 'dummy';
  public commands() {
    return mock;
  }

  public attributes() {
    return {
      class: 'custom',
    };
  }
}

class BigExtension extends NodeExtension {
  public name = 'big' as const;

  public schema: NodeExtensionSpec = {
    toDOM: () => ['h1', 0],
  };

  get defaultOptions() {
    return {
      SSRComponent,
    };
  }
}

let dummy: DummyExtension;
let big: BigExtension;
let manager: ExtensionManager;
let state: EditorState;
let view: EditorView;

beforeEach(() => {
  dummy = new DummyExtension();
  big = new BigExtension();

  manager = ExtensionManager.create([
    ...extensions,
    { extension: dummy, priority: 1 },
    { extension: big, priority: 10 },
  ]);
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
  manager.data.actions.dummy(attrs);
  expect(mock).toHaveBeenCalledWith(attrs);
  expect(innerMock).toHaveBeenCalledWith(state, view.dispatch, view);
});

describe('#properties', () => {
  it('should sort extensions by priority', () => {
    expect(manager.extensions).toHaveLength(11);
    expect(manager.extensions[0]).toEqual(dummy);
    expect(manager.extensions[10]).toEqual(big);
  });

  it('should throw if data accessed without init', () => {
    const testManager = createTestManager();
    expect(() => testManager.data).toThrowErrorMatchingInlineSnapshot(
      `"Extension Manager must be initialized before attempting to access the data"`,
    );
  });
  it('should provide the schema at instantiation', () => {
    expect(createTestManager().schema).toBeTruthy();
  });

  it('should provide access to `attributes`', () => {
    expect(manager.attributes.class).toInclude('custom');
  });

  it('should provide access to `components`', () => {
    expect(manager.components.big).toEqual(SSRComponent);
  });
});

test('isExtensionManager', () => {
  expect(isExtensionManager({})).toBeFalse();
  expect(isExtensionManager(manager)).toBeTrue();
});

describe('#isEqual', () => {
  it('should be equal for the same instance', () => {
    expect(manager.isEqual(manager)).toBeTrue();
  });

  it('should be equal for different instances but identical otherwise', () => {
    expect(createTestManager().isEqual(createTestManager())).toBeTrue();
  });

  it('should not be equal for different managers', () => {
    expect(manager.isEqual(createTestManager())).toBeFalse();
  });

  it('should not be equal for different objects', () => {
    expect(manager.isEqual({})).toBeFalse();
  });
});
