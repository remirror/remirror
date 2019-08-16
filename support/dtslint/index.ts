import {
  ActionsFromExtension,
  DocExtension,
  Extension,
  ExtensionManager,
  NodeExtension,
  TextExtension,
} from '@remirror/core';
import { HistoryExtension } from '@remirror/core-extensions';

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

type HistoryExtensionActions = ActionsFromExtension<HistoryExtension>;
const historyActions: HistoryExtensionActions = {} as any;
historyActions.redo(); // $ExpectType void
historyActions.undo(); // $ExpectType void
historyActions.undo({}); // $ExpectError

const simpleManager = ExtensionManager.create([
  { priority: 1, extension: new DocExtension() },
  { priority: 1, extension: new TextExtension() },
  new HistoryExtension(),
]);
