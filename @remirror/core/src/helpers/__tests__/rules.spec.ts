import { createEditor, doc, horizontalRule, p, schema as testSchema, strong } from 'jest-prosemirror';
import { Slice } from 'prosemirror-model';
import { markInputRule, markPasteRule, nodeInputRule } from '../rules';

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

    view.dispatch(tr.replaceSelection(slice));
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

    view.dispatch(tr.replaceSelection(slice));
    expect(view.state.doc).toEqualPMNode(
      doc(
        p('Some ', strong('@test'), ' ', strong('@content')),
        p('should ', strong('@be'), ' amazing'),
        p(''),
      ),
    );
  });

  it('should not transform when no match found', () => {
    const plugin = markPasteRule(/(Hello)/, testSchema.marks.strong);
    const {
      state: { tr },
      view,
    } = createEditor(doc(p('<cursor>')), { plugins: [plugin] });
    const slice = p('Not The Word').slice(0);

    let newSlice: Slice;

    view.someProp('transformPasted', f => {
      newSlice = f(slice);
      expect(newSlice.eq(slice)).toBe(true);
    });

    view.dispatch(tr.replaceSelection(slice));
    expect(view.state.doc).toEqualPMNode(doc(p('Not The Word')));
  });
});

describe('markInputRule', () => {
  it('should wrap matched content with the specified mark type', () => {
    const getAttrs = jest.fn(() => ({ 'data-testid': 'awesome' }));
    const rule = markInputRule(/~([^~]+)~$/, testSchema.marks.strong, getAttrs);
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const params = [view, from, to, '~'];

    view.someProp('handleTextInput', f => {
      f(...params);
    });

    expect(view.state.doc).toEqualPMNode(doc(p(strong('Hello'))));
    expect(getAttrs).toHaveBeenCalledWith(expect.arrayContaining(['~Hello~', 'Hello']));
  });

  it('should not give false positives', () => {
    const rule = markInputRule(/~([^~]+)~$/, testSchema.marks.strong);
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const params = [view, from, to, '@'];
    view.someProp('handleTextInput', f => {
      const value = f(...params);
      expect(value).toBe(false);
      return value;
    });

    expect(view.state.doc).toEqualPMNode(doc(p('~Hello')));
  });
});

describe('nodeInputRule', () => {
  it('should wrap matched content with the specified mark type', () => {
    const getAttrs = jest.fn(() => ({ 'data-testid': 'awesome' }));
    const rule = nodeInputRule(/~([^~]+)~$/, testSchema.nodes.horizontalRule, getAttrs);
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const params = [view, from, to, '~'];

    view.someProp('handleTextInput', f => {
      f(...params);
    });

    expect(view.state.doc).toEqualPMNode(doc(horizontalRule(), p()));
    expect(getAttrs).toHaveBeenCalledWith(expect.arrayContaining(['~Hello~', 'Hello']));
  });

  it('should not give false positives', () => {
    const rule = nodeInputRule(/~([^~]+)~$/, testSchema.nodes.horizontalRule);
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const params = [view, from, to, '@'];
    view.someProp('handleTextInput', f => {
      const value = f(...params);
      expect(value).toBe(false);
      return value;
    });

    expect(view.state.doc).toEqualPMNode(doc(p('~Hello')));
  });
});
