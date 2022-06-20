import React from 'react';
import { strictRender } from 'testing/react';
import { RemirrorJSON } from '@remirror/core';

import { Callout } from '../';

describe('Callout', () => {
  it('renders callout to HTML', () => {
    const json: RemirrorJSON = {
      type: 'callout',
      attrs: {
        type: 'info',
      },
      content: [
        {
          type: 'text',
          text: 'Important',
        },
      ],
    };
    const { container } = strictRender(<Callout node={json} markMap={{}} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div data-callout-type="info">
        <div>
          Important
        </div>
      </div>
    `);
  });

  it('renders callout with an emoji to HTML', () => {
    const json: RemirrorJSON = {
      type: 'callout',
      attrs: {
        type: 'info',
        emoji: 'ℹ️',
      },
      content: [
        {
          type: 'text',
          text: 'Important',
        },
      ],
    };
    const { container } = strictRender(<Callout node={json} markMap={{}} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div
        data-callout-type="info"
        data-callout-emoji="ℹ️"
      >
        <div class="remirror-callout-emoji-wrapper">
          <span>
            ℹ️
          </span>
        </div>
        <div>
          Important
        </div>
      </div>
    `);
  });
});
