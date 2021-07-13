import { strictRender } from 'testing/react';
import { RemirrorJSON } from '@remirror/core';

import { Doc, RemirrorRenderer, TextHandler } from '../';

const JSON: RemirrorJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is a',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
          ],
          text: 'sample',
        },
        {
          type: 'text',
          text: 'text.',
        },
      ],
    },
  ],
};

describe('RemirrorRenderer', () => {
  it('renders RemirrorJSON to HTML', () => {
    const { container } = strictRender(<RemirrorRenderer json={JSON} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div>
        <p>
          This is a
          <strong>
            sample
          </strong>
          text.
        </p>
      </div>
    `);
  });

  it('supports custom typeMap', () => {
    const typeMap = {
      doc: Doc,
      paragraph: 'div',
      text: TextHandler,
    };
    const { container } = strictRender(<RemirrorRenderer json={JSON} typeMap={typeMap} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div>
        <div>
          This is a
          <strong>
            sample
          </strong>
          text.
        </div>
      </div>
    `);
  });

  it('supports custom markMap', () => {
    const markMap = {
      bold: 'b',
    };
    const { container } = strictRender(<RemirrorRenderer json={JSON} markMap={markMap} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <div>
        <p>
          This is a
          <b>
            sample
          </b>
          text.
        </p>
      </div>
    `);
  });
});
