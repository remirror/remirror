import { NodeViewPortalContainer } from '@remirror/core';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { act, render } from '@testing-library/react';
import { NodeViewPortalComponent } from '../node-view-portal';

describe('NodeViewPortalComponent', () => {
  it('should update on render', () => {
    const portalContainer = new NodeViewPortalContainer();
    const manager = createTestManager();
    manager.init({ getState: jest.fn(), portalContainer } as any);
    manager.initView({} as any);
    const { getByTestId } = render(
      <NodeViewPortalComponent
        portalContainer={portalContainer}
        manager={manager}
        actions={manager.data.actions}
        {...({} as any)}
      />,
    );

    act(() => {
      const mockRender = jest.fn(() => <div data-testid='test' />);
      const element = document.createElement('span');
      document.body.appendChild(element);
      portalContainer.render({ render: mockRender, container: element });
    });

    expect(getByTestId('test')).toBeTruthy();
  });
});
