import { htmlToMarkdown } from '../src/html-to-markdown';

const casesArray = [
  ['strike', '<strike>Lorem ipsum</strike>', '~Lorem ipsum~'],
  ['s', '<s>Lorem ipsum</s>', '~Lorem ipsum~'],
  ['del', '<del>Lorem ipsum</del>', '~Lorem ipsum~'],
  ['unchecked inputs', '<ul><li><input type="checkbox">Check Me!</li></ul>', '*   [ ] Check Me!'],
  [
    'checked inputs',
    '<ul><li><input type="checkbox" checked="">Checked!</li></ul>',
    '*   [x] Checked!',
  ],
  [
    'basic table',
    '<table><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Row 1, Column 1</td><td>Row 1, Column 2</td></tr><tr><td>Row 2, Column 1</td><td>Row 2, Column 2</td></tr></tbody></table>',
    '| Column 1 | Column 2 |\n| --- | --- |\n| Row 1, Column 1 | Row 1, Column 2 |\n| Row 2, Column 1 | Row 2, Column 2 |',
  ],
  [
    'cell alignment',
    '<table><thead><tr><th align="left">Column 1</th><th align="center">Column 2</th><th align="right">Column 3</th><th align="foo">Column 4</th></tr></thead><tbody><tr><td>Row 1, Column 1</td><td>Row 1, Column 2</td><td>Row 1, Column 3</td><td>Row 1, Column 4</td></tr><tr><td>Row 2, Column 1</td><td>Row 2, Column 2</td><td>Row 2, Column 3</td><td>Row 2, Column 4</td></tr></tbody></table>',
    '| Column 1 | Column 2 | Column 3 | Column 4 |\n| :-- | :-: | --: | --- |\n| Row 1, Column 1 | Row 1, Column 2 | Row 1, Column 3 | Row 1, Column 4 |\n| Row 2, Column 1 | Row 2, Column 2 | Row 2, Column 3 | Row 2, Column 4 |',
  ],
  [
    'empty cells',
    '<table><thead><tr><th align="left">Column 1</th><th align="center">Column 2</th><th align="right">Column 3</th><th align="foo">Column 4</th></tr></thead><tbody><tr><td></td><td>Row 1, Column 2</td><td>Row 1, Column 3</td><td>Row 1, Column 4</td></tr><tr><td>Row 2, Column 1</td><td></td><td>Row 2, Column 3</td><td>Row 2, Column 4</td></tr><tr><td>Row 3, Column 1</td><td>Row 3, Column 2</td><td></td><td>Row 3, Column 4</td></tr><tr><td>Row 4, Column 1</td><td>Row 4, Column 2</td><td>Row 4, Column 3</td><td></td></tr><tr><td></td><td></td><td></td><td>Row 5, Column 4</td></tr></tbody></table>\n',
    '| Column 1 | Column 2 | Column 3 | Column 4 |\n| :-- | :-: | --: | --- |\n|  | Row 1, Column 2 | Row 1, Column 3 | Row 1, Column 4 |\n| Row 2, Column 1 |  | Row 2, Column 3 | Row 2, Column 4 |\n| Row 3, Column 1 | Row 3, Column 2 |  | Row 3, Column 4 |\n| Row 4, Column 1 | Row 4, Column 2 | Row 4, Column 3 |  |\n|  |  |  | Row 5, Column 4 |',
  ],
  [
    'empty rows',
    '<table><thead><tr><td>Heading 1</td><td>Heading 2</td></tr></thead><tbody><tr><td>Row 1</td><td>Row 1</td></tr><tr><td></td><td></td></tr><tr><td>Row 3</td><td>Row 3</td></tr></tbody></table>\n',
    '| Heading 1 | Heading 2 |\n| --- | --- |\n| Row 1 | Row 1 |\n|  |  |\n| Row 3 | Row 3 |',
  ],
  [
    'th in first row',
    '<table><tbody><tr><th>Heading</th></tr><tr><td>Content</td></tr></tbody></table>',
    '| Heading |\n| --- |\n| Content |',
  ],
  [
    'th first row in tbody',
    '<table><tbody><tr><th>Heading</th></tr><tr><td>Content</td></tr></tbody></table>',
    '| Heading |\n| --- |\n| Content |',
  ],
  [
    'table with two tbodies',
    '<table><tbody><tr><th>Heading</th></tr><tr><td>Content</td></tr></tbody><tbody><tr><th>Heading</th></tr><tr><td>Content</td></tr></tbody></table>',
    '| Heading |\n| --- |\n| Content |\n| Heading |\n| Content |',
  ],
  [
    'heading cells in both thead and tbody',
    '<table><thead><tr><th>Heading</th></tr></thead><tbody><tr><th>Cell</th></tr></tbody></table>',
    '| Heading |\n| --- |\n| Cell |',
  ],
  // TODO fix this edge case.
  // [
  //   'empty head',
  //   '<table><thead><tr><th></th></tr></thead><tbody><tr><th>Heading</th></tr></tbody></table>',
  //   '| Heading |\n| --- |',
  // ],
  [
    'non-definitive heading row (not converted)',
    '<table><tbody><tr><td>Row 1 Cell 1</td><td>Row 1 Cell 2</td></tr><tr><td>Row 2 Cell 1</td><td>Row 2 Cell 2</td></tr></tbody></table>',
    '<table><tbody><tr><td>Row 1 Cell 1</td><td>Row 1 Cell 2</td></tr><tr><td>Row 2 Cell 1</td><td>Row 2 Cell 2</td></tr></tbody></table>',
  ],
  [
    'non-definitive heading row with th (not converted)',
    '<table><tbody><tr><th>Heading</th><td>Not a heading</td></tr><tr><td>Heading</td><td>Not a heading</td></tr></tbody></table>',
    '<table><tbody><tr><th>Heading</th><td>Not a heading</td></tr><tr><td>Heading</td><td>Not a heading</td></tr></tbody></table>',
  ],
  [
    'highlighted code block with html',
    '<pre><code class="language language-html">&lt;<span class="pl-ent">p</span>&gt;Hello world&lt;/<span class="pl-ent">p</span>&gt;</code></pre>',
    '```html\n<p>Hello world</p>\n```',
  ],
  [
    'highlighted code block with js',
    '<pre><code class="lang lang-js">;(<span class="pl-k">function</span> () {})()</code></pre>',
    '```js\n;(function () {})()\n```',
  ],
  [
    'highlighted remirror code block',
    '<pre><code data-code-block-language="ts">;(<span class="pl-k">function</span> () {})()</code></pre>',
    '```ts\n;(function () {})()\n```',
  ],
  [
    'no language code block',
    '<pre><code>;(<span class="pl-k">function</span> () {})()</code></pre>',
    '```\n;(function () {})()\n```',
  ],
];

describe('htmlToMarkdown', () => {
  it.each(casesArray)('%s', (_, input, expected) => {
    expect(htmlToMarkdown(input)).toBe(expected);
  });
});
