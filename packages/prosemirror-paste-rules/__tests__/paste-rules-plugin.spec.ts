import {
  blockquote,
  createEditor,
  doc,
  em,
  h1,
  h2,
  hardBreak,
  li,
  p,
  schema,
  strong,
  table,
  tableCell,
  tableRow,
  ul,
} from 'jest-prosemirror';
import type { Node as ProsemirrorNode } from 'prosemirror-model';

import { pasteRules } from '../';

describe('pasteRules', () => {
  describe('type: mark', () => {
    it('should transform simple content', () => {
      const plugin = pasteRules([
        { regexp: /(Hello)/, markType: schema.marks.strong, type: 'mark' },
      ]);

      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('Hello')
        .callback((content) => expect(content.doc).toEqualProsemirrorNode(doc(p(strong('Hello')))));
    });

    it('should transform multiple matches in text content', () => {
      const plugin = pasteRules([
        { regexp: /(@[a-z]+)/, markType: schema.marks.strong, type: 'mark' },
      ]);

      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('Some @test @content should @be amazing')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(
              p(
                'Some ',
                strong('@test'),
                ' ',
                strong('@content'),
                ' should ',
                strong('@be'),
                ' amazing',
              ),
            ),
          );
        });
    });

    it('should support content matches in regex', () => {
      const plugin = pasteRules([
        { regexp: /(?:\*\*|__)([^*_]+)(?:\*\*|__)/, markType: schema.marks.strong, type: 'mark' },
      ]);

      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('**bold** text')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(strong('bold'), ' text')));
        });
    });

    it('should support content matches in regex with spaces', () => {
      const plugin = pasteRules([
        { regexp: /(?:^|[^_])_([^_]+)_/, markType: schema.marks.em, type: 'mark' },
      ]);

      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('spaces before _italic_ text')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('spaces before ', em('italic'), ' text')),
          );
        });
    });

    it('should not transform when no match found', () => {
      const plugin = pasteRules([
        { regexp: /(Hello)/, markType: schema.marks.strong, type: 'mark' },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('Not The Word')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Not The Word')));
        });
    });

    it('should transform complex content', () => {
      const plugin = pasteRules([
        { regexp: /(@[a-z]+)/, markType: schema.marks.strong, type: 'mark' },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste(doc(p('Some @test @content'), p('should @be amazing')))
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(
              p('Some ', strong('@test'), ' ', strong('@content')),
              p('should ', strong('@be'), ' amazing'),
            ),
          );
        });
    });

    it('can remove text matches', () => {
      const plugin = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          transformMatch: () => '',
          type: 'mark',
        },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste(doc(p('Some @test @content'), p('should @be amazing')))
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Some  '), p('should  amazing')));
        });
    });

    it('can keep text but not add mark', () => {
      const plugin = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          transformMatch: () => false,
          type: 'mark',
        },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste(doc(p('Some @test @content'), p('should @be amazing')))
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('Some @test @content'), p('should @be amazing')),
          );
        });
    });

    it('should replace selection', () => {
      const plugin1 = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          type: 'mark',
          replaceSelection: (replacedText) => !!replacedText.trim(),
        },
      ]);
      createEditor(doc(p('<start>   <end>')), { plugins: [plugin1] })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('', strong('@test'))));
        });
      createEditor(doc(p('<start>selected text is not empty<end>')), { plugins: [plugin1] })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('', strong('selected text is not empty'))),
          );
        });

      const plugin2 = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          type: 'mark',
          replaceSelection: true,
        },
      ]);
      createEditor(doc(p('<start>   <end>')), { plugins: [plugin2] })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('', strong('   '))));
        });
      createEditor(doc(p('<start>selected text is not empty<end>')), { plugins: [plugin2] })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('', strong('selected text is not empty'))),
          );
        });
      createEditor(doc(p('<start>multiple text nodes ', strong('are'), ' ', em('selected<end>'))), {
        plugins: [plugin2],
      })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('', strong('multiple text nodes are ', em(strong('selected'))))),
          );
        });
      createEditor(doc(p('<start>ab<end>')), { plugins: [plugin2] })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(strong('ab'))));
        });
      createEditor(doc(p('<start>a<end>')), { plugins: [plugin2] })
        .paste('@test')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(strong('a'))));
        });

      const plugin3 = pasteRules([
        {
          regexp: /https:\/\/www\.[a-z]+\.com/gi,
          markType: schema.marks.strong,
          type: 'mark',
          replaceSelection: (text) => !!text,
          getAttributes: (url, isReplacement) => ({
            href: url,
            auto: !isReplacement,
          }),
        },
      ]);
      // Paste over 1 character
      createEditor(doc(p('<start>a<end>')), { plugins: [plugin3] })
        .paste('https://www.google.com/')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(strong('a'))));
        });
      // Paste over 2 characters
      createEditor(doc(p('<start>ab<end>')), { plugins: [plugin3] })
        .paste('https://www.google.com/')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(strong('ab'))));
        });
      // Paste over 5 characters
      createEditor(doc(p('<start>abcde<end>')), { plugins: [plugin3] })
        .paste('https://www.google.com/')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(strong('abcde'))));
        });
    });

    it('should not create invalid nodes with duplicate marks', () => {
      const plugin = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          type: 'mark',
          replaceSelection: (replacedText) => !!replacedText.trim(),
        },
      ]);
      createEditor(doc(p('<start>foo<end>')), { plugins: [plugin] })
        .paste(p('@bar'))
        .callback((content) => {
          content.doc.check();
          expect(content.doc).toEqualProsemirrorNode(doc(p('', strong('foo'))));
        });
      createEditor(doc(p('<start>foo<end>')), { plugins: [plugin] })
        .paste(p(strong('@bar')))
        .callback((content) => {
          content.doc.check();
          expect(content.doc).toEqualProsemirrorNode(doc(p('', strong('foo'))));
        });
      createEditor(doc(p('<start><end>')), { plugins: [plugin] })
        .paste(p(strong('@bar')))
        .callback((content) => {
          content.doc.check();
          expect(content.doc).toEqualProsemirrorNode(doc(p('', strong('@bar'))));
        });
    });

    it('should not create a slice with invalid open depth', () => {
      const plugin = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          type: 'mark',
        },
      ]);
      const editor = createEditor(
        doc(
          ul(
            li(
              p('A'),
              ul(
                li(
                  p('B'),
                  ul(
                    li(
                      p('C'),
                      ul(
                        //
                        li(p('<start>@foo<end>')),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        { plugins: [plugin] },
      );

      const copied = editor.copied;

      editor.paste({
        text: copied.text.replace('@foo', '@bar'),
        html: copied.html.replace('@foo', '@bar'),
      });

      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          ul(
            li(
              p('A'),
              ul(
                li(
                  p('B'),
                  ul(
                    li(
                      p('C'),
                      ul(
                        ///
                        li(p(strong('@bar'))),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    });
  });

  describe('type: text', () => {
    it('can transform text matches', () => {
      const plugin = pasteRules([
        { regexp: /(Hello)/, transformMatch: () => 'Transformed Hello', type: 'text' },
      ]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('Hello')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello Transformed Hello')));
        });
    });

    it('can remove text matches', () => {
      const plugin = pasteRules([{ regexp: /(Hello)/, transformMatch: () => '', type: 'text' }]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('Hello')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello ')));
        });
    });

    it('can remove text matches by returning false', () => {
      const plugin = pasteRules([{ regexp: /(Hello)/, transformMatch: () => false, type: 'text' }]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('Hello')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello ')));
        });
    });

    it('can transform from matched regex', () => {
      const plugin = pasteRules([{ regexp: /abc(Hello)abc/, type: 'text' }]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('abcHelloabc')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello')));
        });
    });
  });

  describe('type: node', () => {
    it('can transform node matches', () => {
      const plugin = pasteRules([
        { regexp: /^# ([\s\w]+)$/, type: 'node', nodeType: schema.nodes.heading },
      ]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('# This is a heading')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello '), h1('This is a heading')));
        });
    });

    it('can transform multiple block nodes', () => {
      const plugin = pasteRules([
        {
          regexp: /^# ([\s\w]+)$/,
          type: 'node',
          nodeType: schema.nodes.heading,
          getAttributes: () => ({
            level: 1,
          }),
        },
        {
          regexp: /^## ([\s\w]+)$/,
          type: 'node',
          nodeType: schema.nodes.heading,
          getAttributes: () => ({
            level: 2,
          }),
        },
      ]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('# This is a heading\n\n## This is another heading')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('Hello '), h1('This is a heading'), h2('This is another heading')),
          );
        });
    });

    it('can transform multiple inline nodes', () => {
      const inlineEmoji = schema.nodes.atomInline;
      const plugin = pasteRules([
        {
          regexp: /[😊😠😢😂]/u,
          type: 'node',
          nodeType: inlineEmoji,
          getContent: () => {},
          getAttributes: (match) => ({ code: match[0] }),
        },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('A😊B😠C')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p('A', inlineEmoji.create(), 'B', inlineEmoji.create(), 'C')),
          );
        });
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('😊😠')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(p(inlineEmoji.create(), inlineEmoji.create())),
          );
        });
    });

    it('can remove text without group', () => {
      const plugin = pasteRules([
        {
          regexp: /---$/,
          type: 'node',
          nodeType: schema.nodes.hard_break,
          getContent: () => {},
        },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('---')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(hardBreak())));
        });
    });

    it('can handle openStart and openEnd correctly', () => {
      const plugin = pasteRules([
        {
          regexp: /---/,
          type: 'node',
          nodeType: schema.nodes.hard_break,
          getContent: () => {},
        },
        {
          regexp: /===/,
          type: 'node',
          nodeType: schema.nodes.hard_break,
          getContent: () => {},
        },
        {
          regexp: /^# ([\s\w]+)$/,
          type: 'node',
          nodeType: schema.nodes.heading,
          getAttributes: () => ({
            level: 1,
          }),
        },
      ]);
      createEditor(doc(blockquote(p('A<cursor>Z'))), { plugins: [plugin] })
        .paste('B')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(blockquote(p('ABZ'))));
        })
        // Pasting inline node(s) should keey openStart and openEnd
        .paste('---')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(blockquote(p('AB', hardBreak(), 'Z'))));
        })
        .paste('C')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(blockquote(p('AB', hardBreak(), 'CZ'))));
        })
        .paste('---===')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(blockquote(p('AB', hardBreak(), 'C', hardBreak(), hardBreak(), 'Z'))),
          );
        })
        .paste('D')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(blockquote(p('AB', hardBreak(), 'C', hardBreak(), hardBreak(), 'D', 'Z'))),
          );
        })
        // Pasting block node(s) should reset openStart and openEnd
        .paste('# E\n# F\n---\n---===G\n# H')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(
              blockquote(
                p('AB', hardBreak(), 'C', hardBreak(), hardBreak(), 'D'),
                h1('E'),
                h1('F'),
                p(hardBreak()),
                p(hardBreak(), hardBreak(), 'G'),
                h1('H'),
                p('Z'),
              ),
            ),
          );
        })
        .paste('I')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(
              blockquote(
                p('AB', hardBreak(), 'C', hardBreak(), hardBreak(), 'D'),
                h1('E'),
                h1('F'),
                p(hardBreak()),
                p(hardBreak(), hardBreak(), 'G'),
                h1('H'),
                p('IZ'),
              ),
            ),
          );
        });
    });

    it('can remove text with group', () => {
      const plugin = pasteRules([
        {
          regexp: /(---)$/,
          type: 'node',
          nodeType: schema.nodes.hard_break,
          getContent: () => {},
        },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('---')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p(hardBreak())));
        });
    });

    it('can transform match to custom content', () => {
      const plugin = pasteRules([
        {
          regexp: /(::table(\d+))$/,
          type: 'node',
          nodeType: schema.nodes.table,
          getContent: (match) => {
            const size = Number.parseInt(match[2] ?? '0', 10);
            const rows: ProsemirrorNode[] = [];

            for (let i = 0; i < size; i++) {
              const cells: ProsemirrorNode[] = [];

              for (let j = 0; j < size; j++) {
                const paragraph = schema.nodes.paragraph.createChecked();
                const cell = schema.nodes.table_cell.createChecked(null, paragraph);
                cells.push(cell);
              }

              const row = schema.nodes.table_row.createChecked(null, cells);
              rows.push(row);
            }

            return rows;
          },
        },
      ]);
      createEditor(doc(p('<cursor>')), { plugins: [plugin] })
        .paste('::table3')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(
              table(
                tableRow(tableCell(p()), tableCell(p()), tableCell(p())),
                tableRow(tableCell(p()), tableCell(p()), tableCell(p())),
                tableRow(tableCell(p()), tableCell(p()), tableCell(p())),
              ),
            ),
          );
        });
    });
  });
});
