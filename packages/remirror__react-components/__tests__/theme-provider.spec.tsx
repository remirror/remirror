import { strictRender } from 'testing/react';

import { ThemeProvider } from '../';

describe('ThemeProvider', () => {
  it('should render', () => {
    const { container } = strictRender(
      <ThemeProvider
        theme={{ color: { background: 'red', muted: 'orange' }, fontSize: { default: 20 } }}
      >
        Content
      </ThemeProvider>,
    );

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div style="--rmr-color-background: red; --rmr-color-muted: orange; --rmr-font-size-default: 20;"
           class="remirror-theme"
      >
        Content
      </div>
    `);
  });

  it('should render with a custom component', () => {
    const { container } = strictRender(
      <ThemeProvider
        as='span'
        theme={{ color: { background: 'red', muted: 'orange' }, fontSize: { default: 20 } }}
      >
        Content
      </ThemeProvider>,
    );

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <span style="--rmr-color-background: red; --rmr-color-muted: orange; --rmr-font-size-default: 20;"
            class="remirror-theme"
      >
        Content
      </span>
    `);
  });
});
