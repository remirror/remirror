import React from 'react';

import { act, strictRender, useRemirror } from '@remirror/testing/react';

import { PortalContainer, RemirrorPortals, usePortals } from '..';

test('PortalContainer', () => {
  const portalContainer = new PortalContainer();

  const mockListener = jest.fn();
  portalContainer.on(mockListener);

  const mockRender = jest.fn(() => <div data-testid='test' />);
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
  const mock = jest.fn();

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

test('access to context via `useRemirror`', () => {
  expect.assertions(1);

  const container = document.createElement('span');
  const fakeContext = {} as any;

  const Component = () => {
    const context = useRemirror();
    expect(fakeContext).toBe(context);

    return <div data-testid='test' />;
  };

  const portalContainer = new PortalContainer();
  const { rerender } = strictRender(<RemirrorPortals portals={[]} context={fakeContext} />);

  act(() => {
    document.body.append(container);
    portalContainer.render({ Component, container });
  });

  rerender(
    <RemirrorPortals portals={[[container, { key: '1', Component }]]} context={fakeContext} />,
  );
});
