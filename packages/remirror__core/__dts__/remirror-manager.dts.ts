import { AnyRemirrorManager, BuiltinPreset, RemirrorManager } from 'remirror';
import { CorePreset, corePreset, DocExtension, ParagraphExtension } from 'remirror/extensions';

const manager: RemirrorManager<ParagraphExtension | DocExtension | CorePreset | BuiltinPreset> =
  RemirrorManager.create(() => [...corePreset()]);

// @ts-expect-error - Don't allow direct instantiation.
new RemirrorManager(() => []);

// `AnyRemirrorManager` can be used
declare function createManager(manager: AnyRemirrorManager): void;

createManager(manager);
