import { act, render } from '@testing-library/react';
import React from 'react';

import { createBaseManager } from '@remirror/test-fixtures';

import { PortalContainer, RemirrorPortals } from '..';
import { RemirrorProvider } from '../../components';
import { useRemirror } from '../../hooks';

describe('RemirrorPortals', () => {
  const container = document.createElement('span');
  container.id = 'root';

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should update on render', () => {
    const portalContainer = new PortalContainer();
    const { getByTestId } = render(<RemirrorPortals portalContainer={portalContainer} />);
    const mockRender = jest.fn(() => <div data-testid='test' />);

    act(() => {
      document.body.append(container);
      portalContainer.render({ render: mockRender, container });
    });

    expect(getByTestId('test')).toBeTruthy();
    expect(mockRender).toBeCalledWith({}, {});
  });

  it('provides access to the `RemirrorProvider` context', () => {
    expect.assertions(1);
    const manager = createBaseManager();

    const Component = () => {
      const context = useRemirror();
      expect(context).toBeTruthy();

      return <div data-testid='test' />;
    };

    const portalContainer = new PortalContainer();
    render(
      <RemirrorProvider manager={manager}>
        <RemirrorPortals portalContainer={portalContainer} />
      </RemirrorProvider>,
    );

    act(() => {
      document.body.append(container);
      portalContainer.render({ render: Component, container });
    });
  });

  it('removes the portal the when dom node is removed', () => {
    expect.assertions(3);

    const portalContainer = new PortalContainer();
    const { queryByTestId } = render(<RemirrorPortals portalContainer={portalContainer} />);

    act(() => {
      document.body.append(container);
      portalContainer.render({ render: () => <div data-testid='test' />, container });
    });

    expect(queryByTestId('test')).toBeTruthy();

    container.remove();
    portalContainer.on((portals) => {
      expect(portals.has(container)).toBeFalse();
    });

    expect(queryByTestId('test')).toBeNull();
  });
});
