import React from 'react';

import {
  act,
  createReactManager,
  RemirrorProvider,
  strictRender,
  useRemirror,
} from '@remirror/testing/react';

import { PortalContainer, RemirrorPortals } from '..';

describe('RemirrorPortals', () => {
  const container = document.createElement('span');
  container.id = 'root';

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should update on render', () => {
    const portalContainer = new PortalContainer();
    const { getByTestId } = strictRender(<RemirrorPortals portalContainer={portalContainer} />);
    const mockRender = jest.fn(() => <div data-testid='test' />);

    act(() => {
      document.body.append(container);
      portalContainer.render({ Component: mockRender, container });
    });

    expect(getByTestId('test')).toBeTruthy();
    expect(mockRender).toBeCalledWith({}, {});
  });

  it('provides access to the `RemirrorProvider` context', () => {
    const manager = createReactManager([]);

    const Component = () => {
      const context = useRemirror();
      expect(context).toBeTruthy();

      return <div data-testid='test' />;
    };

    const portalContainer = new PortalContainer();
    strictRender(
      <RemirrorProvider manager={manager}>
        <RemirrorPortals portalContainer={portalContainer} />
      </RemirrorProvider>,
    );

    act(() => {
      document.body.append(container);
      portalContainer.render({ Component, container });
    });
  });

  it('removes the portal the when dom node is removed', () => {
    const portalContainer = new PortalContainer();
    const { queryByTestId } = strictRender(<RemirrorPortals portalContainer={portalContainer} />);

    act(() => {
      document.body.append(container);
      portalContainer.render({ Component: () => <div data-testid='test' />, container });
    });

    expect(queryByTestId('test')).toBeTruthy();

    container.remove();
    portalContainer.on((portals) => {
      expect(portals.has(container)).toBeFalse();
    });

    expect(queryByTestId('test')).toBeNull();
  });
});
