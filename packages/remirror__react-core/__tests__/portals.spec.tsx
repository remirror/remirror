import { jest } from '@jest/globals';
import React from 'react';
import { act, strictRender } from 'testing/react';
import {
  MountedPortal,
  PortalContainer,
  RemirrorPortals,
  usePortals,
} from '@remirror/extension-react-component';

import { createReactManager, Remirror, useRemirrorContext } from '../';

test('PortalContainer', () => {
  const portalContainer = new PortalContainer();

  const mockListener: any = jest.fn();
  portalContainer.on(mockListener);

  const mockRender: any = jest.fn(() => <div data-testid='test' />);
  const element = document.createElement('span');
  document.body.append(element);
  portalContainer.render({ Component: mockRender, container: element });

  expect([...portalContainer.portals.entries()]).toHaveLength(1);
  expect(mockListener).toHaveBeenCalledWith(portalContainer.portals);

  portalContainer.remove(element);

  expect([...portalContainer.portals.entries()]).toHaveLength(0);
});

test('usePortals', () => {
  const container = document.createElement('span');
  const portalContainer = new PortalContainer();
  const mock: any = jest.fn();

  const Component = () => {
    const portals = usePortals(portalContainer);
    mock(portals);

    return null;
  };

  strictRender(<Component />);

  act(() => {
    document.body.append(container);
    portalContainer.render({ Component, container });
  });

  expect(mock).toHaveBeenNthCalledWith(1, []);
  expect(mock).toHaveBeenLastCalledWith([[container, { Component, key: expect.any(String) }]]);

  act(() => {
    portalContainer.remove(container);
  });

  expect(mock).toHaveBeenLastCalledWith([]);
});

test('access to context via `useRemirrorContext`', () => {
  const manager = createReactManager(() => []);
  expect.assertions(1);

  const container = document.createElement('span');

  const Component = () => {
    const context = useRemirrorContext();
    expect(context).toBeObject();

    return <div data-testid='test' />;
  };

  interface Props {
    portals: Array<[HTMLElement, MountedPortal]>;
  }

  const Editor = ({ portals }: Props) => (
    <Remirror manager={manager}>
      <RemirrorPortals portals={portals} />
    </Remirror>
  );

  const portalContainer = new PortalContainer();
  const { rerender } = strictRender(<Editor portals={[]} />);

  act(() => {
    document.body.append(container);
    portalContainer.render({ Component, container });
  });

  rerender(<Editor portals={[[container, { key: '1', Component }]]} />);
});
