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
        Important
      </div>
    `);
  });
});
