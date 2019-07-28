import { Merge } from '@remirror/core';
import { baseTheme, RemirrorThemeProvider } from '@remirror/ui';
import { render } from '@testing-library/react';
import React from 'react';
import { Icon } from '../base-icon';

describe('styles', () => {
  it('renders default `component.icon:simple` styles', () => {
    const { container } = render(
      <RemirrorThemeProvider theme={baseTheme}>
        <Icon name='test icon' />
      </RemirrorThemeProvider>,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle(
      `color: ${baseTheme.colors.dark}; background-color: ${baseTheme.colors.background};`,
    );
  });

  it('renders default styles', () => {
    const { container } = render(
      <RemirrorThemeProvider theme={{ ...baseTheme, components: { 'icon:simple': Merge.overwrite() } }}>
        <Icon name='test icon' />
      </RemirrorThemeProvider>,
    );

    const svg = container.querySelector('svg');

    expect(svg).toHaveStyle(
      `color: ${baseTheme.colors.text}; background-color: ${baseTheme.colors.background};`,
    );
  });

  it('can override styles', () => {
    const { container } = render(
      <RemirrorThemeProvider theme={baseTheme}>
        <Icon name='test icon' color='blue' />
      </RemirrorThemeProvider>,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle(`color: blue; background-color: ${baseTheme.colors.background};`);
  });

  it('can be inverted', () => {
    const { container } = render(
      <RemirrorThemeProvider theme={baseTheme}>
        <Icon name='test icon' color='blue' inverse={true} />
      </RemirrorThemeProvider>,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle(`color: ${baseTheme.colors.background}; background-color: blue;`);
  });
});

test('standalone', () => {
  const { getByRole, getByText, rerender } = render(
    <RemirrorThemeProvider theme={baseTheme}>
      <Icon name='test icon' standalone={true} />
    </RemirrorThemeProvider>,
  );

  const svg = getByRole('img');
  expect(svg.querySelector('title')).toHaveTextContent('test icon');

  rerender(
    <RemirrorThemeProvider theme={baseTheme}>
      <Icon name='test icon' standalone={false} />
    </RemirrorThemeProvider>,
  );

  expect(() => getByRole('img')).toThrow();
  expect(getByText('test icon')).toHaveStyle('position: absolute;');
});
