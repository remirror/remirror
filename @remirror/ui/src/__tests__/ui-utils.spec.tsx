/// <reference types="jest-emotion" />

import { css as emotionCss } from '@emotion/core';
import { render } from '@test-fixtures/testing-library';
import { baseTheme } from '../';
import { RemirrorThemeProvider } from '../ui-provider';
import { cssValueUnits, numberToPixels, sx } from '../ui-utils';

describe('sx', () => {
  it('renders object styles', () => {
    const styles = sx({ color: 'red' });
    const { getByText } = render(<p css={styles}>Test</p>);

    expect(getByText('Test')!).toHaveStyle(`color: red`);
  });

  it('supports strings', () => {
    const styles = sx(`color: red`);
    const { getByText } = render(<p css={styles}>Test</p>);

    expect(getByText('Test')!).toHaveStyle(`color: red`);
  });

  it('supports serialized objects', () => {
    const styles = sx(
      emotionCss`
        color: red;
      `,
    );
    const { getByText } = render(<p css={styles}>Test</p>);

    expect(getByText('Test')!).toHaveStyle(`color: red`);
  });

  it('supports arrays', () => {
    const styles = sx([`color: red;`, { backgroundColor: 'pink' }]);
    const { getByText } = render(<p css={styles}>Test</p>);

    expect(getByText('Test')!).toHaveStyle(`color: red: background-color: pink;`);
  });

  it('composes multiple object styles', () => {
    const styles = sx({ color: 'red' }, { margin: 1, color: 'blue' });
    const { getByText } = render(
      <RemirrorThemeProvider theme={baseTheme}>
        <p css={styles}>Test</p>
      </RemirrorThemeProvider>,
    );

    expect(getByText('Test')!).toHaveStyle(`color: blue; margin: 4px`);
  });

  it('renders variant styles from the theme', () => {
    const theme = { ...baseTheme, v: { test1: { color: 'red ' }, test2: { backgroundColor: 'pink' } } };
    const styles = sx({ variant: 'v.test1' }, { variant: 'v.test2' });

    const { getByText } = render(
      <RemirrorThemeProvider theme={theme}>
        <p css={styles}>Test</p>
      </RemirrorThemeProvider>,
    );
    expect(getByText('Test')).toHaveStyle(`color: red; background-color: pink;`);
  });
});

test('cssValueUnits', () => {
  expect(cssValueUnits('10')).toBe('');
  expect(cssValueUnits('10px')).toBe('px');
  expect(cssValueUnits('10rem')).toBe('rem');
  expect(cssValueUnits('10 vh')).toBe('vh');
  expect(cssValueUnits(10)).toBeUndefined();
});

test('numberToPixels', () => {
  expect(numberToPixels(10)).toBe('10px');
  expect(numberToPixels('11')).toBe('11px');
  expect(numberToPixels('12 px')).toBe('12px');
});
