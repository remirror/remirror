import { RemirrorTestChain } from 'jest-remirror';
import { FC } from 'react';
import { BoldExtension, ItalicExtension } from 'remirror/extensions';
import { docNodeBasicJSON } from 'testing';
import { fireEvent, strictRender } from 'testing/react';

import { createReactManager, Remirror, useRemirrorContext } from '../';

test('`Remirror`', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirrorContext();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const manager = createReactManager(() => []);

  const { getByRole, getByTestId } = strictRender(
    <Remirror initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </Remirror>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');

  expect(target).toContainElement(editor);
});

test('multiple `getRootProps` applied to dom throw an error', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const manager = createReactManager(() => []);

  const TestComponent: FC = () => {
    const { getRootProps } = useRemirrorContext();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <div data-testid='target1' {...getRootProps()} />
      </div>
    );
  };

  expect(() =>
    strictRender(
      <Remirror manager={manager}>
        <TestComponent />
      </Remirror>,
    ),
  ).toThrowErrorMatchingSnapshot();

  spy.mockRestore();
});

test('can run multiple transaction based commands', () => {
  const TestComponent: FC = () => {
    const { getRootProps, commands } = useRemirrorContext<BoldExtension | ItalicExtension>();

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
    <Remirror initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </Remirror>,
  );

  const { p, doc } = chain.nodes;
  const { bold, italic } = chain.marks;

  chain.add(doc(p('<start>This<end>')));
  fireEvent.click(getByRole('button'));

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('This')))));
});

test('can run multiple synchronous non chainable commands', () => {
  const TestComponent: FC = () => {
    const { getRootProps, view } = useRemirrorContext<BoldExtension | ItalicExtension>();

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
    <Remirror initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </Remirror>,
  );

  const { p, doc } = chain.nodes;

  chain.add(doc(p('')));
  fireEvent.click(getByRole('button'));

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p('ab')));
});

describe('`autoRender`', () => {
  it('renders at the start', () => {
    const manager = createReactManager(() => []);
    const { container } = strictRender(
      <Remirror autoRender='start' manager={manager}>
        <div>Hello</div>
      </Remirror>,
    );

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('renders at the start: when set to true', () => {
    const manager = createReactManager(() => []);
    const { container } = strictRender(
      <Remirror autoRender={true} manager={manager}>
        <div>Hello</div>
      </Remirror>,
    );

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('renders at the end', () => {
    const manager = createReactManager(() => []);
    const { container } = strictRender(
      <Remirror autoRender='end' manager={manager}>
        <div>Hello</div>
      </Remirror>,
    );

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('renders by default with no children', () => {
    const manager = createReactManager(() => []);
    const { container } = strictRender(<Remirror manager={manager} />);

    expect(container.innerHTML).toMatchSnapshot();
  });
});
