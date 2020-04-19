import { DocExtension } from '@remirror/extension-doc';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { CorePreset } from '@remirror/preset-core';

import { EditorManager } from '../editor-manager';

EditorManager.of([ParagraphExtension.of(), DocExtension.of(), CorePreset.of()]);
