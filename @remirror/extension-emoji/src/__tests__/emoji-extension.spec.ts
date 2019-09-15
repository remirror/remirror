import { renderEditor } from 'jest-remirror';
import { EmojiExtension } from '../emoji-extension';

describe('inputRules', () => {
  const create = () => renderEditor({ plainNodes: [], others: [new EmojiExtension()] });

  it('replaces emoticons with emoji', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    const content = add(doc(p('<cursor>'))).insertText(':-) hello');
    expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello')));

    const newContent = content.insertText(' :-( ');
    expect(newContent.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😦 ')));
  });

  it('replaces colons with exact name match', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    const content = add(doc(p('<cursor>'))).insertText(':smiley:');
    expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));

    const newContent = content.insertText(' :frowning:');
    expect(newContent.state.doc).toEqualRemirrorDocument(doc(p('😃 😦')));
  });
});
