import { strictRender } from 'testing/react';

import { createIFrameHandler } from '../';

const JSON = {
  type: 'iframe',
  attrs: {
    src: 'https://www.youtube-nocookie.com/embed/ew-mIOGJls0?',
    allowFullScreen: 'true',
    frameBorder: 0,
    type: 'youtube',
    width: null,
    height: null,
  },
};

describe('createIFrameHandler', () => {
  it('renders iFrame to HTML', () => {
    const IFrame = createIFrameHandler();
    const { container } = strictRender(<IFrame node={JSON} markMap={{}} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <iframe src="https://www.youtube-nocookie.com/embed/ew-mIOGJls0?"
              frameborder="0"
              allowfullscreen
      >
      </iframe>
    `);
  });

  it('allows to overwrite attributes', () => {
    const IFrame = createIFrameHandler({ width: '100%' });
    const { container } = strictRender(<IFrame node={JSON} markMap={{}} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <iframe src="https://www.youtube-nocookie.com/embed/ew-mIOGJls0?"
              frameborder="0"
              width="100%"
              allowfullscreen
      >
      </iframe>
    `);
  });
});
