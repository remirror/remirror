import { RemirrorTestChain } from 'jest-remirror';
import { act, strictRender } from 'testing/react';
import { ExtensionPriority, prosemirrorNodeToHtml } from '@remirror/core';
import { createReactManager, Remirror, useRemirror } from '@remirror/react';

import { useKeymaps } from '../use-keymaps';

describe('useKeymaps', () => {
  it('captures keymaps in correct order', () => {
    const editor = RemirrorTestChain.create(createReactManager([], { stringHandler: 'html' }));
    const mock = jest.fn((_: number) => false);
    const HooksComponent = () => {
      useKeymaps({ Enter: () => mock(1) });
      useKeymaps({ Enter: () => mock(2) });
      useKeymaps({ Enter: () => mock(3) });
      useKeymaps({ Enter: () => mock(4) });

      return null;
    };

    strictRender(
      <Remirror manager={editor.manager} autoRender>
        <HooksComponent />
      </Remirror>,
    );

    act(() => {
      editor.press('Enter');
    });

    expect(mock.mock.calls).toEqual([[1], [2], [3], [4]]);
  });

  it('prioritizes the keymaps', () => {
    const editor = RemirrorTestChain.create(createReactManager([], { stringHandler: 'html' }));
    const mock = jest.fn((_: number) => false);
    const HooksComponent = () => {
      useKeymaps({ Enter: () => mock(1) }, ExtensionPriority.Default);
      useKeymaps({ Enter: () => mock(2) }, ExtensionPriority.Highest);
      useKeymaps({ Enter: () => mock(3) }, ExtensionPriority.Medium);
      useKeymaps({ Enter: () => mock(4) }, ExtensionPriority.Critical);

      return null;
    };

    strictRender(
      <Remirror manager={editor.manager} autoRender>
        <HooksComponent />
      </Remirror>,
    );

    act(() => {
      editor.press('Enter');
    });

    expect(mock.mock.calls).toEqual([[4], [2], [3], [1]]);
  });

  it('responds to events in strict mode with a controlled editor', () => {
    const chain = RemirrorTestChain.create(createReactManager([], { stringHandler: 'html' }));
    const mockSubmit = jest.fn();

    const Component = () => {
      const { manager, onChange, state } = useRemirror({
        extensions: chain.manager,
        content: '<p>test</p>',
        stringHandler: 'html',
        selection: 'end',
      });

      function onSubmit() {
        mockSubmit(prosemirrorNodeToHtml(state.doc));
      }

      return (
        <Remirror manager={manager} onChange={onChange} state={state} autoRender>
          <div id='1'>
            <KeymapComponent onSubmit={onSubmit} />
          </div>
        </Remirror>
      );
    };

    interface TextEditorProps {
      onSubmit: () => void;
    }

    const KeymapComponent = (props: TextEditorProps) => {
      useKeymaps({
        Enter: () => {
          props.onSubmit();
          return false;
        },
      });

      return null;
    };

    strictRender(<Component />);
    act(() => {
      chain.press('Enter');
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // NOTE: the reason this doesn't match the dom value is that the keymap
    // intercepts the call before the updated state. The value has not yet been
    // updated.
    expect(mockSubmit).toHaveBeenCalledWith('<p>test</p>');

    expect(chain.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        test
      </p>
      <p>
        <br>
      </p>
    `);
  });
});
