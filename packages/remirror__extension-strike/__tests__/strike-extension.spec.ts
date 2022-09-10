import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { StrikeExtension } from '../';

extensionValidityTest(StrikeExtension);

describe('inputRules', () => {
  const {
    add,
    nodes: { p, doc },
    marks: { strike },
  } = renderEditor<StrikeExtension>([new StrikeExtension()]);

  it('should match input rule', () => {
    add(doc(p('Start<cursor>')))
      .insertText(' ~strike here!~ for input rule match')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(
          doc(p('Start ', strike('strike here!'), ' for input rule match')),
        );
      });
  });

  it('should ignore whitespace', () => {
    add(doc(p('<cursor>')))
      .insertText('~ ~\n   ~')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('~ ~\n'), p('   ~')));
      });
  });
});

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    marks: { strike },
    commands,
  } = renderEditor<StrikeExtension>([new StrikeExtension()]);

  it('#toggleStrike', () => {
    add(doc(p('Hello <start>strike<end>, lets dance.')));
    commands.toggleStrike();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <s>
          strike
        </s>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(
      doc(p('Hello ', strike('strike'), ', lets dance.')),
    );

    commands.toggleStrike();
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello strike, lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello strike, lets dance.')));
  });
});
