import React from 'react';
import { markupPreset } from 'remirror/preset/markup';
import { RemirrorProvider, useRemirror } from 'remirror/react';

export default { title: 'Markup' };

const EditorWrapper = () => {};

export const MarkupEditor = () => <WysiwygEditor></WysiwygEditor>;
