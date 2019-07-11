import { NodeViewPortalContainer } from '@remirror/core';
import { act, render } from '@testing-library/react';
import { NodeViewPortalComponent } from '../portal';

describe('NodeViewPortalComponent', () => {
  it('should update on render', () => {
    const portalContainer = new NodeViewPortalContainer();
    const { getByTestId } = render(<NodeViewPortalComponent portalContainer={portalContainer} />);

    act(() => {
      const mockRender = jest.fn(() => <div data-testid='test' />);
      const element = document.createElement('span');
      document.body.appendChild(element);
      portalContainer.render({ render: mockRender, container: element });
    });

    expect(getByTestId('test')).toBeTruthy();
  });
});
