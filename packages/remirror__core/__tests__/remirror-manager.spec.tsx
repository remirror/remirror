import { createEditor, doc, p } from 'jest-prosemirror';
import {
  isRemirrorManager,
  NodeExtension,
  NodeViewsExtension,
  PlainExtension,
  RemirrorManager,
} from 'remirror';
import { corePreset, createCoreManager, HeadingExtension } from 'remirror/extensions';
import { createFramework, hideConsoleError } from 'testing';
import { EMPTY_PARAGRAPH_NODE, ExtensionPriority, ExtensionTag } from '@remirror/core-constants';
import type {
  Dispose,
  KeyBindingCommandFunction,
  NodeExtensionSpec,
  NodeViewMethod,
  ProsemirrorAttributes,
} from '@remirror/core-types';
import { Schema } from '@remirror/pm/model';
import { EditorState, Plugin } from '@remirror/pm/state';
import { EditorView } from '@remirror/pm/view';

describe('Manager', () => {
  let state: EditorState;

  const innerMock = jest.fn();
  const mock = jest.fn((_: ProsemirrorAttributes) => innerMock);
  const getInformation = jest.fn(() => 'information');

  class DummyExtension extends PlainExtension {
    get name() {
      return 'dummy' as const;
    }

    createTags() {
      return [ExtensionTag.Behavior, ExtensionTag.LastNodeCompatible];
    }

    createCommands() {
      return { dummy: mock };
    }

    createHelpers() {
      return {
        getInformation,
      };
    }

    createAttributes() {
      return {
        class: 'custom',
      };
    }
  }

  class BigExtension extends NodeExtension {
    static disableExtraAttributes = true;

    get name() {
      return 'big' as const;
    }

    createNodeSpec(): NodeExtensionSpec {
      return {
        toDOM: () => ['h1', 0],
      };
    }
  }

  const dummyExtension = new DummyExtension({ priority: ExtensionPriority.Critical });
  const bigExtension = new BigExtension({ priority: ExtensionPriority.Lowest });

  let manager = RemirrorManager.create([dummyExtension, bigExtension, ...corePreset()]);

  let view: EditorView;

  beforeEach(() => {
    manager = RemirrorManager.create(() => [dummyExtension, bigExtension, ...corePreset()]);
    manager.attachFramework(createFramework(manager), () => {});
    state = manager.createState({ content: EMPTY_PARAGRAPH_NODE });
    view = new EditorView(document.createElement('div'), {
      state,
      editable: () => true,
    });
    manager.addView(view);
  });

  hideConsoleError(true);

  it('enforces constructor privacy', () => {
    // @ts-expect-error
    expect(() => new RemirrorManager({})).toThrow();
  });

  it('supports commands', () => {
    const attributes = { a: 'a' };
    manager.store.commands.dummy(attributes);

    expect(mock).toHaveBeenCalledWith(attributes);
    expect(innerMock).toHaveBeenCalledWith({
      state: manager.view.state,
      dispatch: manager.view.dispatch,
      view: manager.view,
      tr: manager.tr,
    });
  });

  it('supports helpers', () => {
    const value = manager.store.helpers.getInformation();

    expect(value).toBe('information');
    expect(getInformation).toHaveBeenCalled();
  });

  describe('#properties', () => {
    it('should sort extensions by priority', () => {
      expect(manager.extensions[0]?.name).toBe('dummy');
      expect(manager.extensions[manager.extensions.length - 1]?.name).toBe('big');
    });

    it('should allow overriding the priority', () => {
      manager = manager.recreate([], { priority: { dummy: ExtensionPriority.Lowest } });
      expect(manager.extensions[0]?.name).not.toBe('dummy');
      expect(manager.extensions[manager.extensions.length - 1]?.name).toBe('big');
      expect(manager.extensions[manager.extensions.length - 2]?.name).toBe('dummy');
    });

    it('should provide the schema at instantiation', () => {
      expect(createCoreManager([]).schema).toBeInstanceOf(Schema);
    });

    it('should provide access to `attributes`', () => {
      expect(manager.store.attributes.class).toInclude('custom');
    });

    hideConsoleError(true);

    it('should initialize the `extensionStore` with the correct values', () => {
      const manager = createCoreManager([]);

      expect(Object.keys(manager.extensionStore)).toMatchSnapshot();
      expect(manager.extensionStore.previousState).toBeUndefined();
      expect(() => manager.extensionStore.currentState).toThrowErrorMatchingSnapshot();
      expect(manager.extensionStore.getState).toEqual(expect.any(Function));
    });
  });

  it('isManager', () => {
    expect(isRemirrorManager({})).toBeFalse();
    expect(isRemirrorManager(null)).toBeFalse();
    expect(isRemirrorManager(dummyExtension)).toBeFalse();
    expect(isRemirrorManager(manager, ['dummy', 'biggest'])).toBeFalse();
    expect(isRemirrorManager(manager, [class A extends DummyExtension {}])).toBeFalse();
    expect(isRemirrorManager(manager)).toBeTrue();
    expect(isRemirrorManager(manager, [DummyExtension])).toBeTrue();
    expect(isRemirrorManager(manager, ['dummy', 'big'])).toBeTrue();
  });

  it('output', () => {
    const manager = createCoreManager([]);
    expect(manager.output).toBeUndefined();
    const framework = createFramework(manager);

    manager.attachFramework(framework, () => {});
    expect(manager.output).toBe(framework.frameworkOutput);
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

    createKeymap() {
      return {
        Enter: mocks.firstEnter,
      };
    }
  }

  class SecondExtension extends PlainExtension {
    get name() {
      return 'second' as const;
    }

    createKeymap() {
      return {
        Enter: mocks.secondEnter,
      };
    }
  }

  class ThirdExtension extends PlainExtension {
    get name() {
      return 'third' as const;
    }

    createKeymap() {
      return {
        Enter: mocks.thirdEnter,
      };
    }
  }

  const manager = RemirrorManager.create(() => [
    new FirstExtension(),
    new SecondExtension(),
    new ThirdExtension(),
    ...corePreset(),
  ]);
  manager.attachFramework(createFramework(manager), () => {});

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

test('lifecycle', () => {
  expect.assertions(5);

  class LifecycleExtension extends PlainExtension {
    static defaultPriority = ExtensionPriority.Lowest;

    get name() {
      return 'test' as const;
    }

    onCreate() {
      expect(this.store.setExtensionStore).toBeFunction();
      expect(this.store.setStoreKey).toBeFunction();
      expect(this.store.getStoreKey).toBeFunction();
      expect(this.store.tags).toBeObject();
      expect(this.store.schema).toBeInstanceOf(Schema);
    }
  }

  const extension = new LifecycleExtension();
  createCoreManager([extension]);
});

describe('createEmptyDoc', () => {
  it('can create an empty doc', () => {
    const manager = RemirrorManager.create([...corePreset()]);

    expect(manager.createEmptyDoc().toJSON()).toMatchInlineSnapshot(`
          Object {
            "content": Array [
              Object {
                "type": "paragraph",
              },
            ],
            "type": "doc",
          }
      `);
  });

  it('creates an empty doc with alternative content', () => {
    const headingManager = RemirrorManager.create([
      ...corePreset({ content: 'heading+' }),
      new HeadingExtension(),
    ]);
    expect(headingManager.createEmptyDoc()).toMatchInlineSnapshot(`
      Prosemirror node: {
        "type": "doc",
        "content": [
          {
            "type": "heading",
            "attrs": {
              "level": 1
            }
          }
        ]
      }
    `);
  });
});

describe('options', () => {
  it('can add extra plugins', () => {
    const extraPlugin = new Plugin({});
    const manager = createCoreManager([], { plugins: [extraPlugin] });

    expect(manager.store.plugins).toContain(extraPlugin);
  });

  it('can add additional nodeViews', () => {
    const custom: NodeViewMethod = jest.fn(() => ({}));
    const nodeViews: Record<string, NodeViewMethod> = { custom };
    const manager = createCoreManager([], { nodeViews });

    expect(manager.getExtension(NodeViewsExtension).plugin.spec.props?.nodeViews?.custom).toBe(
      custom,
    );
  });
});

test('disposes of methods', () => {
  const mocks = {
    create: jest.fn(),
    view: jest.fn(),
  };

  class DisposeExtension extends PlainExtension {
    get name() {
      return 'dispose' as const;
    }

    onCreate(): Dispose {
      return mocks.create;
    }

    onView(): Dispose {
      return mocks.view;
    }
  }

  const manager = RemirrorManager.create(() => [new DisposeExtension(), ...corePreset()]);
  const framework = createFramework(manager);

  const view = new EditorView(document.createElement('div'), {
    state: framework.initialEditorState,
    editable: () => true,
  });

  manager.attachFramework(framework, () => {});
  manager.addView(view);

  manager.destroy();

  expect(mocks.create).toHaveBeenCalledTimes(1);
  expect(mocks.view).toHaveBeenCalledTimes(1);
});
