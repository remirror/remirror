import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { createBaseManager, docNodeBasicJSON } from '@remirror/test-fixtures';

import { useRemirror } from '../../hooks';
import { RemirrorProvider, ThemeProvider } from '../providers';

test('RemirrorProvider', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const manager = createBaseManager();

  const { getByRole, getByTestId } = render(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');

  expect(target).toContainElement(editor);
});

describe('ThemeProvider', () => {
  it('should render', () => {
    const { container } = render(
      <ThemeProvider
        theme={{ color: { background: 'red', muted: 'orange' }, fontSize: { default: 20 } }}
      >
        Content
      </ThemeProvider>,
    );

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div style="--remirror-color-background: red; --remirror-color-muted: orange; --remirror-font-size-default: 20;">
        Content
      </div>
    `);
  });

  it('should render with a custom component', () => {
    const { container } = render(
      <ThemeProvider
        as='span'
        theme={{ color: { background: 'red', muted: 'orange' }, fontSize: { default: 20 } }}
      >
        Content
      </ThemeProvider>,
    );

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <span style="--remirror-color-background: red; --remirror-color-muted: orange; --remirror-font-size-default: 20;">
        Content
      </span>
    `);
  });
});
