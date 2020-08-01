import { CorePreset, DocExtension, ParagraphExtension } from '@remirror/testing';

import type { BuiltinPreset } from '../../builtins';
import { RemirrorManager } from '../remirror-manager';

const manager: RemirrorManager<
  ParagraphExtension | DocExtension | CorePreset | BuiltinPreset
> = RemirrorManager.fromObject({
  extensions: [new ParagraphExtension(), new DocExtension()],
  presets: [new CorePreset()],
});

// @ts-expect-error
new RemirrorManager({ extensions: [], presets: [] });
