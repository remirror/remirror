import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { BoldExtension, BulletListExtension, HeadingExtension } from 'remirror/extensions';

import { CountExtension, CountOptions, CountStrategy } from '../';

extensionValidityTest(CountExtension);

function create(options?: CountOptions) {
  return renderEditor([
    new CountExtension(options),
    new BulletListExtension(),
    new HeadingExtension(),
    new BoldExtension(),
  ]);
}

describe('helpers', () => {
  describe('`getCountMaximum`', () => {
    it('returns -1 if no maximum is set', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p('This is some content')));

      expect(helpers.getCountMaximum()).toBe(-1);
    });

    it('returns the maximum if it is set', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create({ maximum: 314 });
      add(doc(p('This is some content')));

      expect(helpers.getCountMaximum()).toBe(314);
    });
  });

  describe('getCharacterCount', () => {
    it('returns the character count of a single line', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p('This is some content')));

      expect(helpers.getCharacterCount()).toBe(20);
    });

    it('returns the character count of multiple lines', () => {
      const {
        add,
        nodes: { doc, heading, p },
        helpers,
      } = create();
      add(doc(heading('My heading'), p('This is some content')));

      expect(helpers.getCharacterCount()).toBe(31);
    });

    it('returns the character count of deep content', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create();
      add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('List items')))));

      expect(helpers.getCharacterCount()).toBe(34);
    });

    it('counts new line characters', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p(), p(), p('Line 3')));

      expect(helpers.getCharacterCount()).toBe(8);
    });

    it('handles marks', () => {
      const {
        add,
        nodes: { doc, p },
        marks: { bold: b },
        helpers,
      } = create();
      add(doc(p('This is ', b('some content'))));

      expect(helpers.getCharacterCount()).toBe(20);
    });
  });

  describe('getWordCount', () => {
    it('returns the word count of a single line', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p('This is some content')));

      expect(helpers.getWordCount()).toBe(4);
    });

    it('returns the word count of multiple lines', () => {
      const {
        add,
        nodes: { doc, heading, p },
        helpers,
      } = create();
      add(doc(heading('My heading'), p('This is some content')));

      expect(helpers.getWordCount()).toBe(6);
    });

    it('returns the word count of deep content', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create();
      add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('List items')))));

      expect(helpers.getWordCount()).toBe(6);
    });

    it('ignores empty lines', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p(), p(' '), p('Line 3')));

      expect(helpers.getWordCount()).toBe(2);
    });

    it('handles marks', () => {
      const {
        add,
        nodes: { doc, p },
        marks: { bold: b },
        helpers,
      } = create();
      add(doc(p('This is ', b('some content'))));

      expect(helpers.getWordCount()).toBe(4);
    });
  });

  describe('isCountValid', () => {
    it('returns true if no character maximum is set (empty doc)', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p()));

      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns true if no character maximum is set (large doc)', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create();
      add(doc(p('Word '.repeat(500))));

      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns true if no word maximum is set (empty doc)', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create({ maximumStrategy: CountStrategy.WORDS });
      add(doc(p()));

      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns true if no word maximum is set (large doc)', () => {
      const {
        add,
        nodes: { doc, p },
        helpers,
      } = create({ maximumStrategy: CountStrategy.WORDS });
      add(doc(p('Word '.repeat(500))));

      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns true if doc is under the character limit', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create({ maximum: 40 });
      add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('Under limit')))));

      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns true if doc is equal to the character limit', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create({ maximum: 40 });
      add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('Equals the limit')))));

      expect(helpers.getCharacterCount()).toBe(40);
      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns false if doc is over the character limit', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create({ maximum: 40 });
      add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('Exceeds the limit')))));

      expect(helpers.getCharacterCount()).toBe(41);
      expect(helpers.isCountValid()).toBeFalse();
    });

    it('returns true if doc is under the word limit', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
      add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('List items')))));

      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns true if doc is equal to the word limit', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
      add(
        doc(
          ul(
            li(p('Some text')),
            li(p('Over multiple')),
            li(p('List items')),
            li(p('Equal to the limit')),
          ),
        ),
      );

      expect(helpers.getWordCount()).toBe(10);
      expect(helpers.isCountValid()).toBeTrue();
    });

    it('returns false if doc is over the word limit', () => {
      const {
        add,
        nodes: { doc, bulletList: ul, listItem: li, p },
        helpers,
      } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
      add(
        doc(
          ul(
            li(p('Some text')),
            li(p('Over multiple')),
            li(p('List items')),
            li(p('Exceeds the maximum word limit')),
          ),
        ),
      );

      expect(helpers.getWordCount()).toBe(11);
      expect(helpers.isCountValid()).toBeFalse();
    });
  });
});

describe('rendering', () => {
  it('does not render decoration if no character maximum set (empty doc)', () => {
    const {
      add,
      nodes: { doc, p },
      dom,
    } = create();
    add(doc(p()));

    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('does not render decoration if no character maximum is set (large doc)', () => {
    const {
      add,
      nodes: { doc, p },
      dom,
    } = create();
    add(doc(p('Word '.repeat(500))));

    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('does not render decoration if no word maximum is set (empty doc)', () => {
    const {
      add,
      nodes: { doc, p },
      dom,
    } = create({ maximumStrategy: CountStrategy.WORDS });
    add(doc(p()));

    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('does not render decoration if no word maximum is set (large doc)', () => {
    const {
      add,
      nodes: { doc, p },
      dom,
    } = create({ maximumStrategy: CountStrategy.WORDS });
    add(doc(p('Word '.repeat(500))));

    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('does not render decoration if doc is under the character limit', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      dom,
    } = create({ maximum: 40 });
    add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('Under limit')))));

    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('does not render decoration if doc is equal to the character limit', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      helpers,
      dom,
    } = create({ maximum: 40 });
    add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('Equals the limit')))));

    expect(helpers.getCharacterCount()).toBe(40);
    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('renders the decoration if the doc is over the character limit', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      helpers,
      dom,
    } = create({ maximum: 40 });
    add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('Exceeds the limit')))));

    expect(helpers.getCharacterCount()).toBe(41);
    // eslint-disable-next-line jest/no-large-snapshots
    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <ul>
        <li>
          <p>
            Some text
          </p>
        </li>
        <li>
          <p>
            Over multiple
          </p>
        </li>
        <li>
          <p>
            Exceeds the limi
            <span class="remirror-max-count-exceeded">
              t
            </span>
          </p>
        </li>
      </ul>
    `);
  });

  it('renders the decoration if the doc is over the character limit with multiple lines and marks', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      marks: { bold: b },
      dom,
    } = create({ maximum: 40 });
    add(
      doc(
        ul(
          li(p('Some text')),
          li(p('Over multiple')),
          li(p('Exceeds the limit')),
          li(p('Over ', b('multiple'), 'lines')),
        ),
      ),
    );

    // eslint-disable-next-line jest/no-large-snapshots
    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <ul>
        <li>
          <p>
            Some text
          </p>
        </li>
        <li>
          <p>
            Over multiple
          </p>
        </li>
        <li>
          <p>
            Exceeds the limi
            <span class="remirror-max-count-exceeded">
              t
            </span>
          </p>
        </li>
        <li>
          <p>
            <span class="remirror-max-count-exceeded">
              Over
            </span>
            <strong>
              <span class="remirror-max-count-exceeded">
                multiple
              </span>
            </strong>
            <span class="remirror-max-count-exceeded">
              lines
            </span>
          </p>
        </li>
      </ul>
    `);
  });

  it('does not render decoration if doc is under the word limit', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      dom,
    } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
    add(doc(ul(li(p('Some text')), li(p('Over multiple')), li(p('List items')))));

    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('does not render decoration if doc is equal to the word limit', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      helpers,
      dom,
    } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
    add(
      doc(
        ul(
          li(p('Some text')),
          li(p('Over multiple')),
          li(p('List items')),
          li(p('Equal to the limit')),
        ),
      ),
    );

    expect(helpers.getWordCount()).toBe(10);
    expect(dom.querySelector('.remirror-max-count-exceeded')).toBeNull();
  });

  it('renders the decoration if the doc is over the word limit', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      helpers,
      dom,
    } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
    add(
      doc(
        ul(
          li(p('Some text')),
          li(p('Over multiple')),
          li(p('List items')),
          li(p('Exceeds the maximum word limit')),
        ),
      ),
    );

    expect(helpers.getWordCount()).toBe(11);
    // eslint-disable-next-line jest/no-large-snapshots
    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <ul>
        <li>
          <p>
            Some text
          </p>
        </li>
        <li>
          <p>
            Over multiple
          </p>
        </li>
        <li>
          <p>
            List items
          </p>
        </li>
        <li>
          <p>
            Exceeds the maximum word
            <span class="remirror-max-count-exceeded">
              limit
            </span>
          </p>
        </li>
      </ul>
    `);
  });

  it('renders the decoration if the doc is over the word limit with multiple lines and marks', () => {
    const {
      add,
      nodes: { doc, bulletList: ul, listItem: li, p },
      marks: { bold: b },
      dom,
    } = create({ maximum: 10, maximumStrategy: CountStrategy.WORDS });
    add(
      doc(
        ul(
          li(p('Some text')),
          li(p('Over multiple')),
          li(p('List items')),
          li(p('Exceeds the maximum word limit')),
          li(p('Over ', b('multiple'), 'lines')),
        ),
      ),
    );

    // eslint-disable-next-line jest/no-large-snapshots
    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <ul>
        <li>
          <p>
            Some text
          </p>
        </li>
        <li>
          <p>
            Over multiple
          </p>
        </li>
        <li>
          <p>
            List items
          </p>
        </li>
        <li>
          <p>
            Exceeds the maximum word
            <span class="remirror-max-count-exceeded">
              limit
            </span>
          </p>
        </li>
        <li>
          <p>
            <span class="remirror-max-count-exceeded">
              Over
            </span>
            <strong>
              <span class="remirror-max-count-exceeded">
                multiple
              </span>
            </strong>
            <span class="remirror-max-count-exceeded">
              lines
            </span>
          </p>
        </li>
      </ul>
    `);
  });
});
