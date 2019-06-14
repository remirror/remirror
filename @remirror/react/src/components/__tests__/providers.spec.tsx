import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { InjectedRemirrorProps } from '@remirror/react-utils';
import { withRemirror } from '../../hocs';
import { useRemirror } from '../../hooks';
import { ManagedRemirrorProvider } from '../providers';
import { RemirrorManager } from '../remirror-manager';

describe('ManagedRemirrorProvider', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();
    return <div data-testid='target' {...getRootProps()} />;
  };

  const HOC: FC<InjectedRemirrorProps> = ({ getRootProps }) => {
    return <div data-testid='target' {...getRootProps()} />;
  };

  const TestComponentHOC = withRemirror(HOC);

  it('supports getRootProps via hooks', () => {
    const { getByRole, getByTestId } = render(
      <RemirrorManager>
        <ManagedRemirrorProvider customRootProp={true}>
          <TestComponent />
        </ManagedRemirrorProvider>
      </RemirrorManager>,
    );
    const target = getByTestId('target');
    const editor = getByRole('textbox');
    expect(target).toContainElement(editor);
  });

  it('supports getRootProps via HOC', () => {
    const { getByRole, getByTestId } = render(
      <RemirrorManager>
        <ManagedRemirrorProvider customRootProp={true}>
          <TestComponentHOC />
        </ManagedRemirrorProvider>
      </RemirrorManager>,
    );
    const target = getByTestId('target');
    const editor = getByRole('textbox');
    expect(target).toContainElement(editor);
  });
});
