import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { hideConsoleError } from 'testing';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { defaultDestroyProvider, YjsExtension, YjsOptions } from '../';

let provider = new WebrtcProvider('global', new Doc());

beforeEach(() => {
  provider.destroy();
  provider = new WebrtcProvider('global', new Doc());
});

extensionValidityTest(YjsExtension, {
  getProvider: () => provider,
});

describe('configuration', () => {
  hideConsoleError(true);

  it('throws without a provider', () => {
    expect(() => renderEditor([new YjsExtension()])).toThrowErrorMatchingSnapshot();
  });

  it('calls the destroy provider', () => {
    const destroyProvider = jest.fn(defaultDestroyProvider);
    const { manager } = create({ destroyProvider });

    manager.destroy();
    expect(destroyProvider).toHaveBeenCalledTimes(1);

    // Make sure the method is only called once.
    manager.destroy();
    expect(destroyProvider).toHaveBeenCalledTimes(1);
  });

  it('can update options dynamically', () => {
    const { manager } = create();
    const extension = manager.getExtension(YjsExtension);

    const getProvider = jest.fn(() => provider);
    const destroyProvider = jest.fn(defaultDestroyProvider);

    extension.setOptions({ getProvider, destroyProvider });
    expect(extension.options.getProvider).toBe(getProvider);
    expect(extension.options.destroyProvider).toBe(destroyProvider);
    expect(destroyProvider).not.toHaveBeenCalled();
    expect(getProvider).toHaveBeenCalledTimes(1);

    extension.setOptions({ getProvider: () => provider });
    expect(extension.options.destroyProvider).toHaveBeenCalledTimes(1);
  });
});

describe('commands', () => {
  hideConsoleError(true);

  it('can undo', () => {
    const { nodes, add } = create();
    const { p, doc } = nodes;
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback(({ commands }) => {
        expect(commands.yUndo.isEnabled()).toBeTrue();
        commands.yUndo();
        expect(commands.yUndo.isEnabled()).toBeFalse();
      })
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('')));
      });
  });

  it('can redo', () => {
    const { nodes, add } = create();
    const { p, doc } = nodes;

    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback(({ commands }) => {
        expect(commands.yRedo.isEnabled()).toBeFalse();
        commands.yUndo();
        expect(commands.yRedo.isEnabled()).toBeTrue();
        commands.yRedo();
        expect(commands.yRedo.isEnabled()).toBeFalse();
      })
      .callback(({ state }) => {
        expect(state.doc).toEqualRemirrorDocument(doc(p('Text goes here')));
      });
  });
});

describe('keymap', () => {
  hideConsoleError(true);

  it('can undo', () => {
    const { nodes, add } = create();
    const { p, doc } = nodes;

    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .shortcut('Mod-z')
      .callback((content) => {
        expect(content.state.doc).toEqualProsemirrorNode(doc(p('')));
      });
  });

  it('can redo', () => {
    const { nodes, add } = create();
    const { p, doc } = nodes;

    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .shortcut('Mod-z')
      .shortcut('Mod-y')
      .callback((content) => {
        expect(content.state.doc).toEqualProsemirrorNode(doc(p('Text goes here')));
      });
  });
});

/**
 * Create a `yjs` extension.
 */
function create(options?: Partial<YjsOptions>, excludeHistory = true) {
  let excludeExtensions: ['history'] | undefined;

  if (excludeHistory) {
    excludeExtensions = ['history'];
  }

  const extension = new YjsExtension({
    getProvider: () => provider,
    ...options,
  });

  return renderEditor([extension], { core: { excludeExtensions } });
}
