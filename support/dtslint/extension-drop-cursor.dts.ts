import { HelpersFromExtensions } from '@remirror/core';
import { DropCursorExtension } from '@remirror/core-extensions';

type DropCursorExtensionHelpers = HelpersFromExtensions<DropCursorExtension>;
const cursorHelpers: DropCursorExtensionHelpers = {} as any;
cursorHelpers.isDragging(); // $ExpectType boolean
