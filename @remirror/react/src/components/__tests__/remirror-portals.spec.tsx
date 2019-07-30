import { PortalContainer } from '@remirror/core';
import { act, render } from '@testing-library/react';
import { RemirrorPortals } from '../remirror-portals';

describe('NodeViewPortalComponent', () => {
  it('should update on render', () => {
    const portalContainer = new PortalContainer();
    const { getByTestId } = render(<RemirrorPortals portalContainer={portalContainer} />);

    act(() => {
      const mockRender = jest.fn(() => <div data-testid='test' />);
      const element = document.createElement('span');
      document.body.appendChild(element);
      portalContainer.render({ render: mockRender, container: element });
    });

    expect(getByTestId('test')).toBeTruthy();
  });
});
