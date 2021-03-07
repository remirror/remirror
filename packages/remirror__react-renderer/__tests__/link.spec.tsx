import { strictRender } from 'testing/react';

import { createLinkHandler } from '../';

const LINK = {
  href: 'https://www.example.com',
  target: null,
  auto: false,
  children: <>example.com</>,
};

describe('createLinkHandler', () => {
  it('renders link to HTML', () => {
    const Link = createLinkHandler();
    const { container } = strictRender(<Link {...LINK} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <a href="https://www.example.com">
        example.com
      </a>
    `);
  });

  it('allows to overwrite attributes', () => {
    const Link = createLinkHandler({ target: '_blank' });
    const { container } = strictRender(<Link {...LINK} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <a href="https://www.example.com"
         target="_blank"
      >
        example.com
      </a>
    `);
  });
});
