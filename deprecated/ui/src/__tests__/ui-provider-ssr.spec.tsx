/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

import { RenderEditor } from '@remirror/react';
import { createTestManager } from '@remirror/test-fixtures';

import { baseTheme, RemirrorThemeProvider } from '..';

describe('withoutEmotion', () => {
  /// TODO figure out how to get this working with built code tests
  it.skip('should not render extra class names when true', () => {
    const child = () => <div data-testid='test' />;
    const withEmotionString = renderToString(
      <RemirrorThemeProvider theme={baseTheme} withoutEmotion={false}>
        <RenderEditor manager={createTestManager()}>{child}</RenderEditor>
      </RemirrorThemeProvider>,
    );

    expect(withEmotionString).toMatch(/css-[\da-z]+/gi);

    const withoutEmotionString = renderToString(
      <RemirrorThemeProvider theme={baseTheme} withoutEmotion={true}>
        <RenderEditor manager={createTestManager()}>{child}</RenderEditor>
      </RemirrorThemeProvider>,
    );

    expect(withoutEmotionString).not.toMatch(/css-[\da-z]+/gi);
  });
});
