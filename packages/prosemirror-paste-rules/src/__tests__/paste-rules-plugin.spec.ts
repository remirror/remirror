import { createEditor, doc, em, h1, p, schema, strong } from 'jest-prosemirror';

import { pasteRules } from '../paste-rules-plugin';

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

    it.skip('should transform complex content', () => {
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
  });

  describe('type: text', () => {
    it('can transform text matches', () => {
      const plugin = pasteRules([
        { regexp: /(Hello)/, transformMatch: (match) => 'Transformed Hello', type: 'text' },
      ]);
      createEditor(doc(p('Hello <cursor>')), { plugins: [plugin] })
        .paste('Hello')
        .callback((content) => {
          expect(content.doc).toEqualProsemirrorNode(doc(p('Hello Transformed Hello')));
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
  });
});
