import { EMPTY_PARAGRAPH_NODE } from '@remirror/core';
import { asDefaultProps, RemirrorProps } from '@remirror/react-utils';

export const defaultProps = asDefaultProps<RemirrorProps>()({
  initialContent: EMPTY_PARAGRAPH_NODE,
  editable: true,
  usesBuiltInExtensions: true,
  attributes: {},
  usesDefaultStyles: true,
  label: '',
  editorStyles: {},
  insertPosition: 'end',
  withoutEmotion: false,
  stringHandler: () => {
    throw new Error(
      'No valid string handler. In order to pass in `string` as `initialContent` to the remirror editor you must provide a valid stringHandler prop',
    );
  },
});
