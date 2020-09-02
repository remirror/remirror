import React, { useRef } from 'react';

import { MentionExtension } from '@remirror/extension-mention';
import { SocialPreset } from '@remirror/preset-social';
import { createReactManager, strictRender } from '@remirror/testing/react';

import { socialManagerArgs } from '../social-utils';
import { useSocialManager } from '../use-social';

jest.mock('../social-utils.ts', () => {
  const actual = jest.requireActual('../social-utils.ts');
  return { ...actual, socialManagerArgs: jest.fn(actual.socialManagerArgs) };
});

describe('useSocialManager', () => {
  it('passes down options', () => {
    const Component = () => {
      const manager = useSocialManager([], { social: { appendText: 'custom' } });
      expect(manager.getExtension(MentionExtension).options.appendText).toBe('custom');
      expect(manager.getPreset(SocialPreset).options.appendText).toBe('custom');

      return null;
    };

    strictRender(<Component />);
  });

  it('can receive a manager', () => {
    const manager = createReactManager(...socialManagerArgs([]));

    const Component = () => {
      const socialManager = useSocialManager(manager);
      expect(socialManager).toBe(manager);

      return null;
    };

    strictRender(<Component />);
  });

  it('only calls `createSocialManagerArgument when props change', () => {
    const rerenderMock = jest.fn();

    const Component = (props: { options?: object; combined?: [] }) => {
      const { options, combined } = props;
      const optionsRef = useRef({});
      const combinedRef = useRef([]);

      useSocialManager(
        combined ? combined : combinedRef.current,
        options ? options : optionsRef.current,
      );
      rerenderMock();

      return null;
    };

    const { rerender } = strictRender(
      <div>
        <Component combined={[]} options={{}} />
      </div>,
    );
    jest.clearAllMocks();

    let updates: Array<[[]?, object?]> = [
      [undefined, undefined],
      [undefined, undefined],
      [undefined, undefined],
      [undefined, undefined],
    ];

    updates.forEach(([combined, options]) =>
      rerender(
        <div style={{}}>
          <Component combined={combined} options={options} />
        </div>,
      ),
    );

    expect(rerenderMock).toHaveBeenCalledTimes(4);
    expect(socialManagerArgs).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();

    updates = [
      [[], {}],
      [[], {}],
      [undefined, undefined],
      [undefined, undefined],
      [undefined, undefined],
      [undefined, undefined],
    ];

    updates.forEach(([combined, options]) =>
      rerender(
        <div style={{}}>
          <Component combined={combined} options={options} />
        </div>,
      ),
    );

    expect(rerenderMock).toHaveBeenCalledTimes(6);
    expect(socialManagerArgs).toHaveBeenCalledTimes(3);
  });
});
