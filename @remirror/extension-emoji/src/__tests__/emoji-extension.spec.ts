import { renderEditor } from 'jest-remirror';
import { EmojiExtension } from '../emoji-extension';

describe('inputRules', () => {
  const create = () => renderEditor({ plainNodes: [], others: [new EmojiExtension()] });

  it('replaces emoticons with emoji', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':-)')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
      })
      .insertText(' hello :@')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡')));
      })
      .insertText(':o')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡:o')));
      })
      .insertText(' ')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡😮 ')));
      });
  });

  it('replaces colons with the exact name match', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':smiley:')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
      })
      .insertText(' :frowning:')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 😦')));
      });
  });
});
