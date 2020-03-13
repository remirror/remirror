/**
 * @jest-environment node
 */

import { Remirror } from '@remirror/react';
import { createTestManager } from '@remirror/test-fixtures';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { RemirrorThemeProvider, baseTheme } from '..';

describe('withoutEmotion', () => {
  /// TODO figure out how to get this working with built code tests
  it.skip('should not render extra class names when true', () => {
    const child = () => <div data-testid='test' />;
    const withEmotionString = renderToString(
      <RemirrorThemeProvider theme={baseTheme} withoutEmotion={false}>
        <Remirror manager={createTestManager()}>{child}</Remirror>
      </RemirrorThemeProvider>,
    );

    expect(withEmotionString).toMatch(/css-[a-z0-9]+/gi);

    const withoutEmotionString = renderToString(
      <RemirrorThemeProvider theme={baseTheme} withoutEmotion={true}>
        <Remirror manager={createTestManager()}>{child}</Remirror>
      </RemirrorThemeProvider>,
    );

    expect(withoutEmotionString).not.toMatch(/css-[a-z0-9]+/gi);
  });
});
