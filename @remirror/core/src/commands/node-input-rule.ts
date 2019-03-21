import { InputRule } from 'prosemirror-inputrules';
import { isFunction } from '../helpers';
import { InputRuleCreator } from '../types';

export const nodeInputRule: InputRuleCreator = (regexp, type, getAttrs) => {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = isFunction(getAttrs) ? getAttrs(match) : getAttrs;
    const { tr } = state;

    if (match[0]) {
      tr.replaceWith(start - 1, end, type.create(attrs!));
    }

    return tr;
  });
};

export const enhancedNodeInputRule: InputRuleCreator = (regexp, type, getAttrs) => {
  return new InputRule(regexp, (state, match, start, end) => {
    end = start > end ? start : end;
    const attrs = isFunction(getAttrs) ? getAttrs(match) : getAttrs;
    const { tr } = state;

    const str = match[0];

    if (str) {
      tr.replaceWith(start, end, type.create(attrs!));
    }

    return tr;
  });
};
