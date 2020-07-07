import { createEditor, doc, p } from 'jest-prosemirror';

import { EMPTY_PARAGRAPH_NODE, ExtensionPriority, ExtensionTag } from '@remirror/core-constants';
import {
  EditorState,
  KeyBindingCommandFunction,
  ProsemirrorAttributes,
} from '@remirror/core-types';
import { EditorView } from '@remirror/pm/view';
import { CorePreset, createBaseManager } from '@remirror/testing';

import { CreateLifecycleMethod, PlainExtension } from '../../extension';
import { isRemirrorManager, RemirrorManager } from '../remirror-manager';

describe('Manager', () => {
  let state: EditorState;

  const innerMock = jest.fn();
  const mock = jest.fn((_: ProsemirrorAttributes) => innerMock);
  const getInformation = jest.fn(() => 'information');

  class DummyExtension extends PlainExtension {
    get name() {
      return 'dummy' as const;
    }
    readonly extensionTags = ['simple', ExtensionTag.LastNodeCompatible];

    createCommands = () => {
      return { dummy: mock };
    };

    createHelpers = () => {
      return {
        getInformation,
      };
    };

    createAttributes = () => {
      return {
        class: 'custom',
      };
    };
  }

  class BigExtension extends PlainExtension {
    get name() {
      return 'big' as const;
    }

    createNodeSpec = () => {
      return {
        toDOM: () => ['h1', 0],
      };
    };
  }

  const dummyExtension = new DummyExtension({ priority: ExtensionPriority.Critical });
  const bigExtension = new BigExtension({ priority: ExtensionPriority.Lowest });
  const corePreset = new CorePreset();

  let manager = RemirrorManager.create([dummyExtension, bigExtension, corePreset]);

  let view: EditorView;

  beforeEach(() => {
    manager = RemirrorManager.fromObject({
      extensions: [dummyExtension, bigExtension],
      presets: [new CorePreset()],
    });
    state = manager.createState({ content: EMPTY_PARAGRAPH_NODE });
    view = new EditorView(document.createElement('div'), {
      state,
      editable: () => true,
    });
    manager.addView(view);
  });

  test('constructor is private', () => {
    // @ts-expect-error
    expect(() => new RemirrorManager({})).toThrowError();
  });

  test('commands', () => {
    const attributes = { a: 'a' };
    manager.store.commands.dummy(attributes);

    expect(mock).toHaveBeenCalledWith(attributes);
    expect(innerMock).toHaveBeenCalledWith({
      state,
      dispatch: view.dispatch,
      view,
      tr: expect.any(Object),
    });
  });

  test('helpers', () => {
    const value = manager.store.helpers.getInformation();

    expect(value).toBe('information');
    expect(getInformation).toHaveBeenCalled();
  });

  describe('#properties', () => {
    it('should sort extensions by priority', () => {
      expect(manager.extensions[0].name).toBe('dummy');
      expect(manager.extensions[manager.extensions.length - 1].name).toBe('big');
    });

    it('should allow overriding the priority', () => {
      manager = manager.recreate([], { priority: { dummy: ExtensionPriority.Lowest } });
      expect(manager.extensions[0].name).not.toBe('dummy');
      expect(manager.extensions[manager.extensions.length - 1].name).toBe('big');
      expect(manager.extensions[manager.extensions.length - 2].name).toBe('dummy');
    });

    it('should provide the schema at instantiation', () => {
      expect(createBaseManager().schema).toBeTruthy();
    });

    it('should provide access to `attributes`', () => {
      expect(manager.store.attributes.class).toInclude('custom');
    });
  });

  it('isManager', () => {
    expect(isRemirrorManager({})).toBeFalse();
    expect(isRemirrorManager(null)).toBeFalse();
    expect(isRemirrorManager(dummyExtension)).toBeFalse();
    expect(isRemirrorManager(manager)).toBeTrue();
  });
});

test('keymaps', () => {
  const mocks = {
    firstEnter: jest.fn((..._: Parameters<KeyBindingCommandFunction>) => false),
    secondEnter: jest.fn((..._: Parameters<KeyBindingCommandFunction>) => false),
    thirdEnter: jest.fn((..._: Parameters<KeyBindingCommandFunction>) => false),
  };

  class FirstExtension extends PlainExtension {
    get name() {
      return 'first' as const;
    }

    createKeymap = () => {
      return {
        Enter: mocks.firstEnter,
      };
    };
  }

  class SecondExtension extends PlainExtension {
    get name() {
      return 'second' as const;
    }

    createKeymap = () => {
      return {
        Enter: mocks.secondEnter,
      };
    };
  }

  class ThirdExtension extends PlainExtension {
    get name() {
      return 'third' as const;
    }

    createKeymap = () => {
      return {
        Enter: mocks.thirdEnter,
      };
    };
  }

  const manager = RemirrorManager.fromObject({
    extensions: [new FirstExtension(), new SecondExtension(), new ThirdExtension()],
    presets: [new CorePreset()],
  });

  createEditor(doc(p('simple<cursor>')), { plugins: manager.store.plugins })
    .insertText('abcd')
    .press('Enter')
    .callback(() => {
      expect(mocks.firstEnter).toHaveBeenCalled();
      expect(mocks.secondEnter).toHaveBeenCalled();
      expect(mocks.thirdEnter).toHaveBeenCalled();

      jest.clearAllMocks();
      mocks.firstEnter.mockImplementation(() => true);
    })
    .press('Enter')
    .callback(() => {
      expect(mocks.firstEnter).toHaveBeenCalled();
      expect(mocks.secondEnter).not.toHaveBeenCalled();
      expect(mocks.thirdEnter).not.toHaveBeenCalled();

      jest.clearAllMocks();
      mocks.firstEnter.mockImplementation(({ next }) => {
        return next();
      });
    })
    .press('Enter')
    .callback(() => {
      expect(mocks.secondEnter).toHaveBeenCalledTimes(1);
      expect(mocks.thirdEnter).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      mocks.secondEnter.mockImplementation(() => true);
    })
    .press('Enter')
    .callback(() => {
      expect(mocks.secondEnter).toHaveBeenCalledTimes(1);
      expect(mocks.thirdEnter).not.toHaveBeenCalled();
    });
});

// "getCommands" | "getChain" | "helpers" | "rebuildKeymap" | "getPluginState" | "replacePlugin" | "reconfigureStatePlugins" | "addPlugins" | "schema" | "tags" | "phase" | "getState"

test('lifecycle', () => {
  expect.assertions(6);

  class LifecycleExtension extends PlainExtension {
    static defaultPriority = ExtensionPriority.Lowest;

    get name() {
      return 'test' as const;
    }

    onCreate: CreateLifecycleMethod = () => {
      expect(this.store.setExtensionStore).toBeFunction();
      expect(this.store.setStoreKey).toBeFunction();
      expect(this.store.getStoreKey).toBeFunction();
      expect(this.store.addPlugins).toBeFunction();
      expect(this.store.tags).toBeTruthy();
      expect(this.store.schema).toBeTruthy();
    };
  }

  const extension = new LifecycleExtension();

  createBaseManager({ extensions: [extension], presets: [] });
});
