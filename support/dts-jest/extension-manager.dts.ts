import {
  ActionsFromExtensions,
  DocExtension,
  Extension,
  HelpersFromExtensions,
  Manager,
  object,
  TextExtension,
} from '@remirror/core';
import {
  BoldExtension,
  CodeBlockExtension,
  HistoryExtension,
  ParagraphExtension,
  PositionTrackerExtension,
} from '@remirror/core-extensions';

class ErrorExtension extends Extension {
  get name() {
    return 'base' as 'base';
  }

  // @dts-jest:fail:snap
  public commands() {
    return {
      nothing: (parameter: string) => () => 'true',
    };
  }
}

type HistoryExtensionActions = ActionsFromExtensions<HistoryExtension>;
const historyActions: HistoryExtensionActions = object();

// @dts-jest:pass:snap
historyActions.redo;
// @dts-jest:pass:snap
historyActions.undo;
// @dts-jest:fail:snap
historyActions.undo({});

type PositionTrackerExtensionHelpers = HelpersFromExtensions<PositionTrackerExtension>;
const trackerHelpers: PositionTrackerExtensionHelpers = object();

// @dts-jest:pass:snap
trackerHelpers.addPositionTracker({ id: 'yo' });
// @dts-jest:pass:snap
trackerHelpers.clearPositionTrackers();

// @dts-jest:pass:snap
Manager.create([
  new HistoryExtension(),
  new ParagraphExtension(),
  new BoldExtension(),
  new CodeBlockExtension(),
  new PositionTrackerExtension(),
  { priority: 1, extension: new TextExtension() },
  { priority: 0, extension: new DocExtension() },
]);

const manager1 = Manager.create([
  new HistoryExtension(),
  new ParagraphExtension(),
  new BoldExtension(),
  new CodeBlockExtension(),
  new PositionTrackerExtension(),
  { priority: 1, extension: new TextExtension() },
  { priority: 0, extension: new DocExtension() },
]);

// @dts-jest:fail:snap
manager1.nodes.awesome;
// @dts-jest:pass:snap
manager1.nodes.paragraph;

// @dts-jest:pass:snap
manager1.data.actions;
// @dts-jest:pass:snap
manager1.data.helpers;

// @dts-jest:pass:snap
manager1.data.actions.addPositionTracker({ id: 'yo' });
// @dts-jest:pass:snap
manager1.data.actions.addPositionTracker;
// @dts-jest:pass:snap
manager1.data.helpers.findPositionTracker('yo');
// @dts-jest:pass:snap
manager1.data.helpers.findPositionTracker;
