// tslint:disable: no-implicit-dependencies
import { Remirror } from '@remirror/react';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { render } from '@test-fixtures/testing-library';
import { ThemeProvider } from 'emotion-theming';
import { baseTheme } from '..';
import { useEmotionTheme, useRemirrorTheme } from '../ui-hooks';
import { RemirrorThemeProvider } from '../ui-provider';

test('uses the base theme when none is provided', () => {
  const ConsumerComponent = () => {
    const { theme } = useRemirrorTheme();
    expect(theme).toEqual(baseTheme);
    return null;
  };

  render(
    <RemirrorThemeProvider theme={{}}>
      <ConsumerComponent />
    </RemirrorThemeProvider>,
  );
});

test('inherits from parent emotion theme', () => {
  const ConsumerComponent = () => {
    const emotionTheme = useEmotionTheme();
    const { theme } = useRemirrorTheme();

    expect(theme.emotion).toBeTrue();
    expect(theme).toEqual(emotionTheme);

    return null;
  };

  render(
    <ThemeProvider theme={{ emotion: true }}>
      <RemirrorThemeProvider theme={{}}>
        <ConsumerComponent />
      </RemirrorThemeProvider>
    </ThemeProvider>,
  );
});

test('overwrites only the selected base theme properties', () => {
  const ConsumerComponent = () => {
    const { theme } = useRemirrorTheme();
    const emotionTheme = useEmotionTheme();

    expect(theme.colors.background).toBe('green');
    expect(theme.colors.text).toBe('blue');
    expect(theme.colors.primary).toBe(baseTheme.colors.primary);
    expect(theme.fonts).toEqual(baseTheme.fonts);
    expect(theme).toEqual(emotionTheme);

    return null;
  };

  render(
    <RemirrorThemeProvider theme={{ colors: { background: 'green', text: 'blue' } }}>
      <ConsumerComponent />
    </RemirrorThemeProvider>,
  );
});

describe('disableMerge', () => {
  it('disables `parent`', () => {
    const ConsumerComponent = () => {
      const { theme } = useRemirrorTheme();

      expect(theme).not.toHaveProperty('test');
      expect(theme).toEqual(baseTheme);

      return null;
    };

    render(
      <RemirrorThemeProvider theme={{ test: { awesome: 'test' } }}>
        <RemirrorThemeProvider theme={{}} disableMerge={['parent']}>
          <ConsumerComponent />
        </RemirrorThemeProvider>
      </RemirrorThemeProvider>,
    );
  });

  it('disables `base`', () => {
    const expected = { test: { awesome: 'test' }, colors: {} } as any;

    const ConsumerComponent = () => {
      const { theme } = useRemirrorTheme();

      expect(theme).toEqual(expected);
      return null;
    };

    render(
      <RemirrorThemeProvider disableMerge={['base']} theme={expected}>
        <ConsumerComponent />
      </RemirrorThemeProvider>,
    );
  });

  it('disables `emotion`', () => {
    const expected = { test: { awesome: 'test' }, colors: {} } as any;

    const ConsumerComponent = () => {
      const { theme } = useRemirrorTheme();

      expect(theme).not.toHaveProperty('emotion');
      return null;
    };

    render(
      <ThemeProvider theme={{ emotion: true }}>
        <RemirrorThemeProvider disableMerge={['emotion']} theme={expected}>
          <ConsumerComponent />
        </RemirrorThemeProvider>
      </ThemeProvider>,
    );
  });
});

describe('withoutEmotion', () => {
  it('should not render extra class names when true', () => {
    const child = () => <div data-testid='test' />;
    const { getByTestId, rerender } = render(<Remirror manager={createTestManager()}>{child}</Remirror>);
    expect(getByTestId('test')).toHaveAttribute('class');

    rerender(
      <RemirrorThemeProvider theme={baseTheme} withoutEmotion={true}>
        <Remirror manager={createTestManager()}>{child}</Remirror>
      </RemirrorThemeProvider>,
    );
    expect(getByTestId('test')).not.toHaveAttribute('class');
  });
});
