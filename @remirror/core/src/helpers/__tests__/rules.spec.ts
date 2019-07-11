import { createEditor, doc, p, schema as testSchema, strong } from 'jest-prosemirror';
import { markPasteRule } from '../rules';

describe('markPasteRule', () => {
  it('should transform simple content', () => {
    const plugin = markPasteRule(/(Hello)/, testSchema.marks.strong);
    const {
      state: { tr },
      view,
    } = createEditor(doc(p('<cursor>')), { plugins: [plugin] });
    let slice = p('Hello').slice(0);
    view.someProp('transformPasted', f => {
      slice = f(slice);
    });

    view.dispatch(
      tr
        .replaceSelection(slice)
        .scrollIntoView()
        .setMeta('paste', true)
        .setMeta('uiEvent', 'paste'),
    );
    expect(view.state.doc).toEqualPMNode(doc(p(strong('Hello'))));
  });

  it('should transform complex content', () => {
    const plugin = markPasteRule(/(@[a-z]+)/, testSchema.marks.strong);
    const {
      state: { tr },
      view,
    } = createEditor(doc(p('<cursor>')), { plugins: [plugin] });

    let slice = doc(p('Some @test @content'), p('should @be amazing')).slice(1);

    view.someProp('transformPasted', f => {
      slice = f(slice);
    });

    view.dispatch(
      tr
        .replaceSelection(slice)
        .scrollIntoView()
        .setMeta('paste', true)
        .setMeta('uiEvent', 'paste'),
    );
    expect(view.state.doc).toEqualPMNode(
      doc(
        p('Some ', strong('@test'), ' ', strong('@content')),
        p('should ', strong('@be'), ' amazing'),
        p(''),
      ),
    );
  });
});
