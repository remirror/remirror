import { InjectedRemirrorProps } from '@remirror/react-utils';
import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { render } from '@test-fixtures/testing-library';
import React, { FC } from 'react';
import { withRemirror } from '../../react-hocs';
import { useRemirror } from '../../react-hooks';
import { ManagedRemirrorProvider } from '../providers';
import { RemirrorManager } from '../remirror-manager';

describe('ManagedRemirrorProvider', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const HOC: FC<InjectedRemirrorProps> = ({ getRootProps }) => {
    const rootProps = getRootProps({ 'data-testid': 'target' });
    return (
      <div>
        <div {...rootProps} />
      </div>
    );
  };

  const TestComponentHOC = withRemirror(HOC);

  it('supports getRootProps via hooks', () => {
    const { getByRole, getByTestId } = render(
      <RemirrorManager>
        <ManagedRemirrorProvider initialContent={docNodeBasicJSON}>
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
        <ManagedRemirrorProvider initialContent={docNodeBasicJSON}>
          <TestComponentHOC />
        </ManagedRemirrorProvider>
      </RemirrorManager>,
    );
    const target = getByTestId('target');
    const editor = getByRole('textbox');
    expect(target).toContainElement(editor);
    expect(editor).toHaveTextContent('basic');
  });
});
