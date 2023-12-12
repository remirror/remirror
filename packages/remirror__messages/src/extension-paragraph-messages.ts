import type { RemirrorMessage } from '@remirror/core-types';

export const INSERT_LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.insert-paragraph.label',
  comment: 'Label for inserting a paragraph.',
  message: 'Insert Paragraph',
};

export const INSERT_DESCRIPTION: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.insert-paragraph.description',
  comment: 'Description for inserting a paragraph.',
  message: 'Insert a new paragraph',
};

export const CONVERT_LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.convert-paragraph.label',
  comment: 'Label for converting the current node into a paragraph.',
  message: 'Convert Paragraph',
};

export const CONVERT_DESCRIPTION: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.convert-paragraph.description',
  comment: 'Description for converting a paragraph.',
  message: 'Convert current block into a paragraph block.',
};
