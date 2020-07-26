import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import { BoldExtension, docNodeBasicJSON, ItalicExtension } from '@remirror/testing';
import { createReactManager, fireEvent, strictRender } from '@remirror/testing/react';

import { useRemirror } from '../../hooks';
import { RemirrorProvider } from '../providers';

test('`RemirrorProvider`', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const manager = createReactManager([]);

  const { getByRole, getByTestId } = strictRender(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');

  expect(target).toContainElement(editor);
});

test('multiple `getRootProps` applied to dom throw an error', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const manager = createReactManager([]);

  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <div data-testid='target1' {...getRootProps()} />
      </div>
    );
  };

  expect(() =>
    strictRender(
      <RemirrorProvider manager={manager}>
        <TestComponent />
      </RemirrorProvider>,
    ),
  ).toThrowErrorMatchingSnapshot();

  spy.mockRestore();
});

test('can run multiple transaction based commands', () => {
  const TestComponent: FC = () => {
    const { getRootProps, commands } = useRemirror<BoldExtension | ItalicExtension>();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <button
          onClick={() => {
            commands.toggleBold();
            commands.toggleItalic();
          }}
        />
      </div>
    );
  };

  const manager = createReactManager([new BoldExtension(), new ItalicExtension()]);
  const chain = RemirrorTestChain.create(manager);

  const { getByRole } = strictRender(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );

  const { p, doc } = chain.nodes;
  const { bold, italic } = chain.marks;

  chain.add(doc(p('<start>This<end>')));
  fireEvent.click(getByRole('button'));

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('This')))));
});

test('can run multiple synchronous non chainable commands', () => {
  const TestComponent: FC = () => {
    const { getRootProps, view } = useRemirror<BoldExtension | ItalicExtension>();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <button
          onClick={() => {
            view.dispatch(view.state.tr.insertText('a'));
            view.dispatch(view.state.tr.insertText('b'));
          }}
        />
      </div>
    );
  };

  const manager = createReactManager([]);
  const chain = RemirrorTestChain.create(manager);

  const { getByRole } = strictRender(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );

  const { p, doc } = chain.nodes;

  chain.add(doc(p('')));
  fireEvent.click(getByRole('button'));

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p('ab')));
});
