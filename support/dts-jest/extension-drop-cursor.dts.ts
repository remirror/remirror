import { HelpersFromExtensions, object } from '@remirror/core';
import { DropCursorExtension } from '@remirror/extension-drop-cursor';

type DropCursorExtensionHelpers = HelpersFromExtensions<DropCursorExtension>;
const cursorHelpers: DropCursorExtensionHelpers = object();

// @dts-jest:pass:snap
cursorHelpers.isDragging();
