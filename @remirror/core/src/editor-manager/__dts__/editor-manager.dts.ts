import { CorePreset, DocExtension, ParagraphExtension } from '@remirror/test-fixtures';

import { EditorManager } from '../editor-manager';

EditorManager.of({
  extensions: [ParagraphExtension.of(), DocExtension.of()],
  presets: [CorePreset.of()],
});
