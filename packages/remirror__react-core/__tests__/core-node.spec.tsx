/**
 * @jest-environment node
 */

import { axe } from 'jest-axe';
import { JSDOM } from 'jsdom';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { hideConsoleError } from 'testing';

import { createReactManager, Remirror } from '../';

const window = new JSDOM().window;
// @ts-expect-error: window has wrong types here
globalThis.window = window;
globalThis.document = window.document;
globalThis.navigator = window.navigator;

describe('basic functionality', () => {
  hideConsoleError(true);

  it('is accessible', async () => {
    const results = await axe(
      renderToString(<Remirror manager={createReactManager([])} autoRender='start' />),
    );

    expect(results).toHaveNoViolations();
  });
});
