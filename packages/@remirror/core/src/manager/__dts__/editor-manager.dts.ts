import type { DocExtension, ParagraphExtension } from 'remirror/extensions';
import { CorePreset, corePreset } from 'remirror/extensions';

import type { BuiltinPreset } from '../../builtins';
import { RemirrorManager } from '../remirror-manager';

const manager: RemirrorManager<
  ParagraphExtension | DocExtension | CorePreset | BuiltinPreset
> = RemirrorManager.create(() => [...corePreset()]);

// @ts-expect-error
new RemirrorManager({ extensions: [], presets: [] });
