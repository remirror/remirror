import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { InjectedRemirrorProps } from '@remirror/react-utils';
import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { withRemirror } from '../../hocs';
import { useRemirror } from '../../hooks';
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
