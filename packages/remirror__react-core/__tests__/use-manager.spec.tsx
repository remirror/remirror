import { act as renderAct, render } from 'testing/react';
import type { AnyRemirrorManager } from '@remirror/core';
import { ReactExtension } from '@remirror/preset-react';
import { useManager } from '@remirror/react';

jest.mock('@remirror/preset-react', () => {
  const actual = jest.requireActual('@remirror/preset-react');
  return {
    ...actual,
    ReactExtension: jest
      .fn()
      .mockImplementation((...args: any[]) => new actual.ReactExtension(...args)),
  };
});

describe('useManager', () => {
  it('does not recreate the react preset for every rerender', () => {
    const Component = (_: { options?: object }) => {
      useManager(() => [], {});

      return null;
    };

    const { rerender } = render(<Component />);
    rerender(<Component options={{}} />);
    rerender(<Component options={{}} />);

    expect(ReactExtension).toHaveBeenCalledTimes(1);
  });

  it('rerenders when the manager is destroyed', () => {
    let manager: AnyRemirrorManager;
    const Component = (_: { options?: object }) => {
      manager = useManager(() => [], {});

      return null;
    };

    const { rerender } = render(<Component />);

    rerender(<Component options={{}} />);
    rerender(<Component options={{}} />);

    renderAct(() => manager.destroy());
    expect(ReactExtension).toHaveBeenCalledTimes(2);

    rerender(<Component options={{}} />);
    expect(ReactExtension).toHaveBeenCalledTimes(2);
  });
});
