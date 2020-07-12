import React from 'react';

import { render } from '@remirror/testing/react';

import { ThemeProvider } from '../providers';

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
      <div style="--remirror-color-background: red; --remirror-color-muted: orange; --remirror-font-size-default: 20;"
           class="remirror-theme"
      >
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
      <span style="--remirror-color-background: red; --remirror-color-muted: orange; --remirror-font-size-default: 20;"
            class="remirror-theme"
      >
        Content
      </span>
    `);
  });
});
