import React, { FC } from 'react';

import { AnyExtension, Manager } from '@remirror/core';
import { PlaceholderExtension } from '@remirror/core-extensions';
import { TestExtension } from '@remirror/test-fixtures';

import { RemirrorExtension } from '../components/remirror-extension';
import { RemirrorManager } from '../components/remirror-manager';
import { getManagerFromComponentTree } from '../react-helpers';

describe('getManagerFromComponentTree', () => {
  const Tester: FC = ({ children }) => {
    return (
      <RemirrorManager>
        {children}
        <RemirrorExtension Constructor={TestExtension} run={true} />
        <RemirrorExtension
          Constructor={PlaceholderExtension}
          emptyNodeClass='empty'
          placeholder='Type here...'
        />
      </RemirrorManager>
    );
  };
  let manager: Manager;

  beforeEach(async () => {
    manager = await getManagerFromComponentTree({ Component: Tester });
  });

  it('should provide a manager instance', async () => {
    expect(manager).toBeInstanceOf(Manager);
  });

  it('should include the new extension', () => {
    expect(manager.extensions).toSatisfy((extensions: AnyExtension[]) =>
      extensions.some((ext) => ext instanceof TestExtension),
    );
  });

  it('should allow for the prop to be custom', async () => {
    const DifferentProp: FC<{ renderSpot: JSX.Element }> = ({ renderSpot }) => {
      return (
        <RemirrorManager>
          <RemirrorExtension Constructor={TestExtension} run={true} />
          <RemirrorExtension
            Constructor={PlaceholderExtension}
            emptyNodeClass='empty'
            placeholder='Type here...'
          />
          <>{renderSpot}</>
        </RemirrorManager>
      );
    };

    await expect(
      getManagerFromComponentTree({ Component: DifferentProp, prop: 'renderSpot' }),
    ).resolves.toBeInstanceOf(Manager);
  });

  it('should throw an error when no manager found because `prop` not rendered', async () => {
    const NoChildren: FC = () => {
      return (
        <RemirrorManager>
          <RemirrorExtension Constructor={TestExtension} run={true} />
          <RemirrorExtension
            Constructor={PlaceholderExtension}
            emptyNodeClass='empty'
            placeholder='Type here...'
          />
        </RemirrorManager>
      );
    };

    await expect(
      getManagerFromComponentTree({ Component: NoChildren }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The manager was not found. Please check that \`NoChildren\` has a prop called \`children\` which is rendered within the \`<RemirrorManager />\` context"`,
    );
  });
});
