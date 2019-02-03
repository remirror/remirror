import { Doc, Paragraph, Text } from '..';

describe('nodes', () => {
  test('doc', () => {
    const doc = new Doc();
    expect(doc.name).toBe('doc');
  });

  test('paragraph', () => {
    const paragraph = new Paragraph();
    expect(paragraph.name).toBe('paragraph');
  });

  test('text', () => {
    const text = new Text();
    expect(text.name).toBe('text');
  });
});
