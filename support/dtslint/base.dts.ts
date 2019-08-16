import {
  ActionsFromExtensions,
  DocExtension,
  Extension,
  ExtensionManager,
  TextExtension,
} from '@remirror/core';
import {
  BoldExtension,
  CodeBlockExtension,
  HistoryExtension,
  ParagraphExtension,
} from '@remirror/core-extensions';

class ErrExtension extends Extension {
  get name() {
    return 'base' as 'base';
  }

  // $ExpectError
  public commands() {
    return {
      nothing: (param: string) => () => 'true',
    };
  }
}

type HistoryExtensionActions = ActionsFromExtensions<HistoryExtension>;
const historyActions: HistoryExtensionActions = {} as any;
historyActions.redo(); // $ExpectType void
historyActions.undo(); // $ExpectType void
historyActions.undo({}); // $ExpectError

// $ExpectType ExtensionManager<DocExtension | HistoryExtension | CodeBlockExtension | ParagraphExtension | TextExtension | BoldExtension>
const manager1 = ExtensionManager.create([
  new HistoryExtension(),
  new ParagraphExtension(),
  new BoldExtension(),
  new CodeBlockExtension(),
  { priority: 1, extension: new TextExtension() },
  { priority: 0, extension: new DocExtension() },
]);

manager1.nodes.awesome; // $ExpectError
manager1.nodes.paragraph; // $ExpectType NodeExtensionSpec
