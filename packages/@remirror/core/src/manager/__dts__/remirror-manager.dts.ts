import type { BuiltinPreset, GetExtensions, GetNodeNameUnion, GetSchema } from 'remirror';
import { RemirrorManager } from 'remirror';
import type {
  BoldExtension,
  DocExtension,
  EventsExtension,
  GapCursorExtension,
  HistoryExtension,
  ParagraphExtension,
  PositionerExtension,
  TextExtension,
} from 'remirror/extensions';
import { CorePreset, corePreset, TableExtension } from 'remirror/extensions';

const manager: RemirrorManager<
  ParagraphExtension | DocExtension | CorePreset | BuiltinPreset
> = RemirrorManager.create(() => [...corePreset()]);

// @ts-expect-error
new RemirrorManager(() => []);

type Tables = GetSchema<
  | TableExtension
  | ParagraphExtension
  | DocExtension
  | DocExtension
  | TextExtension
  | ParagraphExtension
  | BoldExtension
  | HistoryExtension
  // GapCursorExtension
  // PositionerExtension
  // EventsExtension
>;

type A = GetExtensions<ParagraphExtension | DocExtension | CorePreset | BuiltinPreset>;

// `AnyRemirrorManager` can be used
