import {
  createEditor,
  doc,
  em,
  h1,
  hardBreak,
  p,
  schema,
  strong,
  table,
  tableCell,
  tableRow,
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
        .paste('<div>Some @test @content</div><div>should @be amazing</div>')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(
            doc(
              p('Some ', strong('@test'), ' ', strong('@content')),
              p('should ', strong('@be'), ' amazing'),
            ),
          );
        });
    });

    it('should replace selection', () => {
      const plugin1 = pasteRules([
        {
          regexp: /(@[a-z]+)/,
          markType: schema.marks.strong,
          type: 'mark',
          replaceSelection: (replacedText) => {
            return !!replacedText.trim();
          },
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
        { regexp: /# ([\s\w]+)$/, type: 'node', nodeType: schema.nodes.heading },
      ]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('# This is a heading')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello '), h1('This is a heading')));
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
