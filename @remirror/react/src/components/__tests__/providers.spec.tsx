import React, { FC } from 'react';
import { render } from 'react-testing-library';
import { withRemirror } from '../../hocs';
import { useRemirrorContext } from '../../hooks';
import { InjectedRemirrorProps } from '../../types';
import { ManagedRemirrorEditor } from '../providers';
import { RemirrorManager } from '../remirror-manager';

describe('ManagedRemirrorEditor', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirrorContext();
    return <div data-testid='target' {...getRootProps()} />;
  };

  const HOC: FC<InjectedRemirrorProps> = ({ getRootProps }) => {
    return <div data-testid='target' {...getRootProps()} />;
  };

  const TestComponentHOC = withRemirror(HOC);

  it('supports getRootProps via hooks', () => {
    const { getByRole, getByTestId } = render(
      <RemirrorManager>
        <ManagedRemirrorEditor customRootProp={true}>
          <TestComponent />
        </ManagedRemirrorEditor>
      </RemirrorManager>,
    );
    const target = getByTestId('target');
    const editor = getByRole('textbox');
    expect(target).toContainElement(editor);
  });

  it('supports getRootProps via HOC', () => {
    const { getByRole, getByTestId } = render(
      <RemirrorManager>
        <ManagedRemirrorEditor customRootProp={true}>
          <TestComponentHOC />
        </ManagedRemirrorEditor>
      </RemirrorManager>,
    );
    const target = getByTestId('target');
    const editor = getByRole('textbox');
    expect(target).toContainElement(editor);
  });
});
