import { RemirrorTestChain } from 'jest-remirror';
import React, { useState } from 'react';

import { AnyExtension, fromHtml, RemirrorEventListener, toHtml } from '@remirror/core';
import {
  act,
  createReactManager,
  RemirrorProvider,
  strictRender,
  useManager,
  useRemirror,
} from '@remirror/testing/react';

import { useKeymap } from '../use-keymap';

describe('useKeymap', () => {
  it('responds to events in strict mode with a controlled editor', () => {
    const chain = RemirrorTestChain.create(createReactManager([]));
    const mockSubmit = jest.fn();

    const Component = () => {
      const manager = useManager(chain.manager);

      const initialValue = manager.createState({
        content: '<p>test</p>',
        selection: 'end',
        stringHandler: fromHtml,
      });

      const [value, setValue] = useState(initialValue);

      function onSubmit() {
        mockSubmit(toHtml({ node: value.doc, schema: value.schema }));
      }

      const onChange: RemirrorEventListener<AnyExtension> = ({ state }) => {
        setValue(state);
      };

      return (
        <RemirrorProvider manager={manager} onChange={onChange} value={value}>
          <div id='1'>
            <TextEditor />
            <KeymapComponent onSubmit={onSubmit} />
          </div>
        </RemirrorProvider>
      );
    };

    interface TextEditorProps {
      onSubmit: () => void;
    }

    const TextEditor = () => {
      const { getRootProps } = useRemirror();

      return <div {...getRootProps()} />;
    };

    const KeymapComponent = (props: TextEditorProps) => {
      useKeymap({
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
