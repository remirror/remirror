import { createEditor, doc, p } from 'jest-prosemirror';

import { EMPTY_PARAGRAPH_NODE, ExtensionPriority, ExtensionTag } from '@remirror/core-constants';
import {
  EditorState,
  KeyBindingCommandFunction,
  ProsemirrorAttributes,
} from '@remirror/core-types';
import { EditorView } from '@remirror/pm/view';
import { CorePreset, createBaseManager } from '@remirror/test-fixtures';

import { PlainExtension } from '../../extension';
import { EditorManager, isEditorManager } from '../editor-manager';

describe('Manager', () => {
  let state: EditorState;

  const innerMock = jest.fn();
  const mock = jest.fn((_: ProsemirrorAttributes) => innerMock);
  const getInformation = jest.fn(() => 'information');

  class DummyExtension extends PlainExtension {
    public readonly name = 'dummy' as const;
    public readonly extensionTags = ['simple', ExtensionTag.LastNodeCompatible];

    public createCommands = () => {
      return { dummy: mock };
    };

    public createHelpers = () => {
      return {
        getInformation,
      };
    };

    public createAttributes = () => {
      return {
        class: 'custom',
      };
    };
  }

  class BigExtension extends PlainExtension {
    public readonly name = 'big' as const;

    public createNodeSpec = () => {
      return {
        toDOM: () => ['h1', 0],
      };
    };
  }

  const dummyExtension = new DummyExtension({ priority: ExtensionPriority.Critical });
  const bigExtension = new BigExtension({ priority: ExtensionPriority.Lowest });
  const corePreset = new CorePreset({});

  let manager = EditorManager.create({
    extensions: [dummyExtension, bigExtension],
    presets: [corePreset],
  });

  let view: EditorView;

  beforeEach(() => {
    manager = EditorManager.create({
      extensions: [dummyExtension, bigExtension],
      presets: [new CorePreset({})],
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
    expect(() => new EditorManager({})).toThrowError();
  });

  test('commands', () => {
    const attributes = { a: 'a' };
    manager.store.commands.dummy(attributes);

    expect(mock).toHaveBeenCalledWith(attributes);
    expect(innerMock).toHaveBeenCalledWith({ state, dispatch: view.dispatch, view });
  });

  test('helpers', () => {
    const value = manager.store.helpers.getInformation();

    expect(value).toBe('information');
    expect(getInformation).toHaveBeenCalled();
  });

  describe('#properties', () => {
    it('should sort extensions by priority', () => {
      expect(manager.extensions).toHaveLength(16);
      expect(manager.extensions[0]).toEqual(dummyExtension);
      expect(manager.extensions[15]).toEqual(bigExtension);
    });

    it('should provide the schema at instantiation', () => {
      expect(createBaseManager().schema).toBeTruthy();
    });

    it('should provide access to `attributes`', () => {
      expect(manager.store.attributes.class).toInclude('custom');
    });
  });

  test('isManager', () => {
    expect(isEditorManager({})).toBeFalse();
    expect(isEditorManager(null)).toBeFalse();
    expect(isEditorManager(dummyExtension)).toBeFalse();
    expect(isEditorManager(manager)).toBeTrue();
  });

  describe('#isEqual', () => {
    it('should be equal for the same instance', () => {
      expect(manager.isEqual(manager)).toBeTrue();
    });

    it('should be equal for different instances but identical otherwise', () => {
      expect(createBaseManager().isEqual(createBaseManager())).toBeTrue();
    });

    it('should not be equal for different managers', () => {
      expect(manager.isEqual(createBaseManager())).toBeFalse();
    });

    it('should not be equal for different objects', () => {
      expect(manager.isEqual({})).toBeFalse();
    });
  });
});

test('keymaps', () => {
  const mocks = {
    firstEnter: jest.fn((..._: Parameters<KeyBindingCommandFunction>) => false),
    secondEnter: jest.fn((..._: Parameters<KeyBindingCommandFunction>) => false),
    thirdEnter: jest.fn((..._: Parameters<KeyBindingCommandFunction>) => false),
  };

  class FirstExtension extends PlainExtension {
    public readonly name = 'first' as const;

    public createKeymap = () => {
      return {
        Enter: mocks.firstEnter,
      };
    };
  }

  class SecondExtension extends PlainExtension {
    public readonly name = 'second' as const;

    public createKeymap = () => {
      return {
        Enter: mocks.secondEnter,
      };
    };
  }

  class ThirdExtension extends PlainExtension {
    public readonly name = 'third' as const;

    public createKeymap = () => {
      return {
        Enter: mocks.thirdEnter,
      };
    };
  }

  const manager = EditorManager.create({
    extensions: [new FirstExtension(), new SecondExtension(), new ThirdExtension()],
    presets: [new CorePreset({})],
  });

  createEditor(doc(p('simple<cursor>')), { plugins: manager.store.plugins })
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
