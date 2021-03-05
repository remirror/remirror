import { strictRender } from 'testing/react';
import { RemirrorJSON } from '@remirror/core';

import { TextHandler } from '../';

describe('TextHandler', () => {
  it('renders text to HTML', () => {
    const json: RemirrorJSON = {
      type: 'text',
      text: 'Some text',
    };
    const { container } = strictRender(<TextHandler node={json} markMap={{}} />);

    expect(container.innerHTML).toMatchInlineSnapshot('"Some text"');
  });

  it('renders marks', () => {
    const json: RemirrorJSON = {
      type: 'text',
      text: 'bold text',
      marks: [
        {
          type: 'bold',
        },
      ],
    };
    const markMap = {
      bold: 'strong',
    };
    const { container } = strictRender(<TextHandler node={json} markMap={markMap} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <strong>
        bold text
      </strong>
    `);
  });
});
