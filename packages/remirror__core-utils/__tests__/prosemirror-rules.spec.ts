import {
  createEditor,
  doc,
  horizontalRule,
  p,
  schema as testSchema,
  strong,
} from 'jest-prosemirror';

import { markInputRule, nodeInputRule, plainInputRule } from '../';

describe('markInputRule', () => {
  it('should wrap matched content with the specified mark type', () => {
    const getAttributes = jest.fn(() => ({ 'data-testid': 'awesome' }));
    const rule = markInputRule({
      regexp: /~([^~]+)~$/,
      type: testSchema.marks.strong,
      getAttributes: getAttributes,
      beforeDispatch: ({ tr }) => tr.insertText(' '),
    });
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, '~'];

    view.someProp('handleTextInput', (f) => {
      f(...parameters);
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p(strong('Hello'), ' ')));
    expect(getAttributes).toHaveBeenCalledWith(expect.arrayContaining(['~Hello~', 'Hello']));
  });

  it('should not give false positives', () => {
    const rule = markInputRule({ regexp: /~([^~]+)~$/, type: testSchema.marks.strong });
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, '@'];
    view.someProp('handleTextInput', (f) => {
      const value = f(...parameters);

      expect(value).toBe(false);

      return value;
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p('~Hello')));
  });
});

describe('nodeInputRule', () => {
  it('should wrap matched content with the specified node type', () => {
    const getAttributes = jest.fn(() => ({ 'data-testid': 'awesome' }));
    const rule = nodeInputRule({
      regexp: /~([^~]+)~$/,
      type: testSchema.nodes.horizontalRule,
      getAttributes: getAttributes,
    });
    const {
      state: { selection },
      view,
    } = createEditor(doc(p(), p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, '~'];

    view.someProp('handleTextInput', (f) => {
      f(...parameters);
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p(), horizontalRule()));
    expect(getAttributes).toHaveBeenCalledWith(expect.arrayContaining(['~Hello~', 'Hello']));
  });

  it('should not give false positives', () => {
    const rule = nodeInputRule({ regexp: /~([^~]+)~$/, type: testSchema.nodes.horizontalRule });
    const {
      state: { selection },
      view,
    } = createEditor(doc(p('~Hello<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, '@'];
    view.someProp('handleTextInput', (f) => {
      const value = f(...parameters);

      expect(value).toBe(false);

      return value;
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p('~Hello')));
  });
});

describe('plainInputRule', () => {
  it('should replace content with the transformation function', () => {
    const rule = plainInputRule({
      regexp: /abc$/,
      transformMatch: (value) => value[0]?.toUpperCase(),
    });

    const {
      state: { selection },
      view,
    } = createEditor(doc(p('ab<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, 'c'];

    view.someProp('handleTextInput', (f) => {
      f(...parameters);
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p('ABC')));
  });

  it('should support `beforeDispatch`', () => {
    const rule = plainInputRule({
      regexp: /abc$/,
      transformMatch: (value) => value[0]?.toUpperCase(),
      beforeDispatch: ({ tr }) => tr.insertText(' '),
    });

    const {
      state: { selection },
      view,
    } = createEditor(doc(p('ab<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, 'c'];

    view.someProp('handleTextInput', (f) => {
      f(...parameters);
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p('ABC ')));
  });

  it('should work with partial matches', () => {
    const rule = plainInputRule({
      regexp: /(abc)xyz$/,
      transformMatch: ([full, match]) =>
        match ? full?.replace(match, match.toUpperCase()) : undefined,
    });

    const {
      state: { selection },
      view,
    } = createEditor(doc(p('abcxy<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, 'z'];

    view.someProp('handleTextInput', (f) => {
      f(...parameters);
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p('ABCxyz')));
  });

  it('should delete content when the value is an empty string', () => {
    const rule = plainInputRule({
      regexp: /abc$/,
      transformMatch: () => '',
    });

    const {
      state: { selection },
      view,
    } = createEditor(doc(p('ab<cursor>')), { rules: [rule] });
    const { from, to } = selection;
    const parameters = [view, from, to, 'c'];

    view.someProp('handleTextInput', (f) => {
      f(...parameters);
    });

    expect(view.state.doc).toEqualProsemirrorNode(doc(p('')));
  });
});
