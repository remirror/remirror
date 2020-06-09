import { AnyCombinedUnion, EMPTY_PARAGRAPH_NODE, Transaction } from '@remirror/core';
import { asDefaultProps } from '@remirror/react-utils';

import { BaseProps } from './react-types';

export const defaultProps = asDefaultProps<BaseProps<AnyCombinedUnion>>()({
  initialContent: EMPTY_PARAGRAPH_NODE,
  fallbackContent: EMPTY_PARAGRAPH_NODE,
  editable: true,
  usesBuiltInExtensions: true,
  attributes: {},
  usesDefaultStyles: true,
  label: '',
  insertPosition: 'end',
  onDispatchTransaction: (tr: Transaction) => tr,
  stringHandler: () => {
    throw new Error(
      'No valid string handler. In order to pass in `string` as `initialContent` to the remirror editor you must provide a valid stringHandler prop',
    );
  },
});
