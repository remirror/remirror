import { jest } from '@jest/globals';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { hideConsoleError } from 'testing';
import { yUndoPluginKey } from 'y-prosemirror';
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
    expect(() => renderEditor<YjsExtension>([new YjsExtension()])).toThrowErrorMatchingSnapshot();
  });

  it('calls the destroy provider', () => {
    const destroyProvider: any = jest.fn(defaultDestroyProvider);
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

    const getProvider: any = jest.fn(() => provider);
    const destroyProvider: any = jest.fn(defaultDestroyProvider);

    extension.setOptions({ getProvider, destroyProvider });
    expect(extension.options.getProvider).toBe(getProvider);
    expect(extension.options.destroyProvider).toBe(destroyProvider);
    expect(destroyProvider).not.toHaveBeenCalled();
    expect(getProvider).toHaveBeenCalledTimes(1);

    extension.setOptions({ getProvider: () => provider });
    expect(extension.options.destroyProvider).toHaveBeenCalledTimes(1);
  });

  it.each([{ protectedNodes: new Set<string>() }, { trackedOrigins: [] }, { disableUndo: true }])(
    'throws when updating undo-related options (%o)',
    (option: any) => {
      const { manager } = create();
      const extension = manager.getExtension(YjsExtension);

      expect(() => extension.setOptions({ ...option })).toThrowErrorMatchingSnapshot();
    },
  );

  it('uses the same undo manager in each state', () => {
    const { manager } = create();

    const state = manager.createState();
    const initialUndoManager = yUndoPluginKey.getState(state).undoManager;

    const secondState = manager.createState();
    const secondUndoManager = yUndoPluginKey.getState(secondState).undoManager;
    expect(secondUndoManager).toBe(initialUndoManager);
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
        expect(commands.yUndo.enabled()).toBeTrue();
        commands.yUndo();
        expect(commands.yUndo.enabled()).toBeFalse();
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
        expect(commands.yRedo.enabled()).toBeFalse();
        commands.yUndo();
        expect(commands.yRedo.enabled()).toBeTrue();
        commands.yRedo();
        expect(commands.yRedo.enabled()).toBeFalse();
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
