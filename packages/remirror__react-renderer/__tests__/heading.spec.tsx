import { strictRender } from 'testing/react';
import { RemirrorJSON } from '@remirror/core';

import { Heading } from '../';

describe('Heading', () => {
  it('renders different heading levels to HTML', () => {
    const createJson = (level: number): RemirrorJSON => ({
      type: 'heading',
      attrs: {
        level,
      },
      content: [
        {
          type: 'text',
          text: 'Heading',
        },
      ],
    });

    for (let level = 1; level <= 6; level++) {
      const json = createJson(level);
      const { container } = strictRender(<Heading node={json} markMap={{}} />);

      const expected = `
        <h${level}>
          Heading
        </h${level}>
      `;
      expect(container.innerHTML).toMatchInlineSnapshot(expected);
    }
  });
});
