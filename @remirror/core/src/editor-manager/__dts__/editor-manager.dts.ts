import { CorePreset, DocExtension, ParagraphExtension } from '@remirror/test-fixtures';

import { BuiltinPreset } from '../../builtins';
import { EditorManager } from '../editor-manager';

const manager: EditorManager<
  ParagraphExtension | DocExtension | CorePreset | BuiltinPreset
> = EditorManager.fromObject({
  extensions: [new ParagraphExtension(), new DocExtension()],
  presets: [new CorePreset()],
});

// @ts-expect-error
new EditorManager({ extensions: [], presets: [] });
