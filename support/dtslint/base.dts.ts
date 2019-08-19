import {
  ActionsFromExtensions,
  DocExtension,
  Extension,
  ExtensionManager,
  HelpersFromExtensions,
  TextExtension,
} from '@remirror/core';
import {
  BoldExtension,
  CodeBlockExtension,
  HistoryExtension,
  ParagraphExtension,
  PositionTrackerExtension,
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

type PositionTrackerExtensionHelpers = HelpersFromExtensions<PositionTrackerExtension>;
const trackerHelpers: PositionTrackerExtensionHelpers = {} as any;
trackerHelpers.addPositionTracker({ id: 'yo' }); // $ExpectType Transaction<any> | undefined
trackerHelpers.clearPositionTrackers(); // $ExpectType Transaction<any> | undefined

// $ExpectType ExtensionManager<DocExtension | HistoryExtension | PositionTrackerExtension | CodeBlockExtension | ParagraphExtension | TextExtension | BoldExtension>
const manager1 = ExtensionManager.create([
  new HistoryExtension(),
  new ParagraphExtension(),
  new BoldExtension(),
  new CodeBlockExtension(),
  new PositionTrackerExtension(),
  { priority: 1, extension: new TextExtension() },
  { priority: 0, extension: new DocExtension() },
]);

manager1.nodes.awesome; // $ExpectError
manager1.nodes.paragraph; // $ExpectType NodeExtensionSpec

manager1.data.actions.addPositionTracker({ id: 'yo' });
manager1.data.helpers.findPositionTracker('yo'); // $ExpectType number | undefined
