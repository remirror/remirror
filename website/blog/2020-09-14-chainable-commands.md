---
slug: chainable-commands
title: Chainable commands
author: Ifiok Jr.
author_title: Remirror Maintainer
author_url: https://github.com/ifiokjr
author_image_url: https://avatars1.githubusercontent.com/u/1160934?v=4
tags: [remirror, prosemirror, chaining, commands, state]
---

One of the goals of `remirror@1.0.0` is to make consuming commands easier. Chainable commands was identified as one way in which this could be achieved.

```ts
commands
  .insertText('Hello')
  .capitalize({ from: 1, to: 6 })
  .toggleBold()
  .removeVowels()
  .formatCodeBlocks()
  .run();
```

Elegant as it may seem, implementing this posed some challenges.

<!-- truncate -->

## Challenges

By default Prosemirror commands use the following type signature.

```ts
type ProsemirrorCommandFunction = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView,
) => boolean;
```

Each command receives the current editor state and is expected to create a new transaction by calling `state.tr` [^1].

When the dispatch function is provided the command applies that transaction to the view by calling `dispatch(tr)`. The command is expected to return `true` when successful and `false` when no update is possible.

The transaction created via `state.tr` is responsible for updating the state and describing the desired updates. In ProseMirror the `EditorState` is immutable and the `Transaction` is mutable with methods that change the internal state.

When these methods are called, steps are added to the `tr.steps` property. When the transaction is dispatched, ProseMirror reads the steps and other updated properties to create a new immutable `EditorState`.

Examples of transaction methods are, `tr.insertText`, `tr.scrollIntoView` and `tr.removeMark`. This is how updates are managed within every **ProseMirror** editor.

Since each command creates it's internal `Transaction` instance updates are expected to occur sequentially in separate synchronous steps. This poses a challenge. Without a shared transaction it's not possible to chain the commands since many things can interfere with the update process.

## Configuring `remirror` for chainable commands

The first step was to provide a **shared** transaction for all internal **remirror** commands.

Since the command functions already receive _three_ positional arguments adding a _fourth_ for the shared transaction made the function call overly complex. To make things easier to consume, all the arguments have been squashed into one parameter, giving the remirror command function the following type signature.

```ts
interface CommandFunctionProps {
  tr: Transaction;
  state: EditorState;
  dispatch?: (tr: Transaction) => void;
  view?: EditorView;
}

type CommandFunction = (parameter: CommandFunctionProps) => boolean;
```

The exact way that this was done is beyond the scope of this blog post but you can take a look for yourself how the shared transaction is [created](https://github.com/remirror/remirror/blob/3a89f121cb10b5ef6a0b2705aa5b9e65a4ad469e/packages/%40remirror/core/src/builtins/commands-extension.ts#L54-L100) and [maintained](https://github.com/remirror/remirror/blob/3a89f121cb10b5ef6a0b2705aa5b9e65a4ad469e/packages/%40remirror/core/src/builtins/commands-extension.ts#L167-L173).

After providing all commands with a shared transaction another problem arises. Each command still calls a dispatch function.

The `dispatch` function typically uses the `view.dispatch` function to trigger updates in the editor. If we use this method within a chained command, the shared transaction is no longer valid. This leads to multiple `ProseMirror` errors.

The simplest way to fix this is to provide a fake dispatch function. It does nothing to the editor and thus maintains the sanctity of the shared transaction.

Additionally, a check is made to ensure that the transaction passed into the `dispatch(tr)` method is the expected `shared` transaction. If not, it throws an error.

Now all that's left is to create a chainable JavaScript object.

```ts
class CommandsExtension extends PlainExtension {
  // The shared transaction is automatically updated after state updates.
  tr: Transaction;
  view: EditorView;
  state: EditorState;

  getChainedObject(chainableCommands) {
    const chained = {};

    // The dispatch function.
    const dispatch = (tr) => {
      if (tr !== this.tr) {
        throw new Error(`Please use the provided shared transaction for the command: ${name}`);
      }
    };

    for (const [name, command] of Object.entries(chainableCommands)) {
      chained[name] = (...args) => {
        command(...args)({ state: this.state, tr: this.tr, view: this.view, dispatch });
        return chained;
      };
    }

    // The chained object which has all the chainable methods.
    return chained;
  }
}
```

Finally, at some point the chain needs to come to an end. For this, I defined a methods called `run` method which uses `view.dispatch` to update the state with the shared transaction.

```ts
// Continuing from the above example.
chained.run = (): void => {
  this.view.dispatch(this.tr);
};
```

This is the setup required for **remirror** to make any internal command chainable.

The following example is how commands created in remirror are automatically chainable. It uses the shared `tr` property to accomplish this.

```ts
import { CommandFunction, PlainExtension } from 'remirror';

class CustomExtension extends PlainExtension {
  get name() {
    return 'custom' as const;
  }

  createCommands() {
    return {
      insertAmazingWord:
        (word: string): CommandFunction =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.insertText(`${word}Amazing!`);
          }

          return true;
        },
    };
  }
}
```

## External commands

While this solves the chainable problem for internally created commands, it doesn't do much for external commands. Libraries like `prosemirror-commands`, `prosemirror-tables`, `prosemirror-schema-list` provide useful commands which aren't chainable in the ways described above.

In order to mitigate this we need to pass in a state, that uses the shared transaction. This can be accomplished with the following function which replaces the `state.tr` with the passed in transaction. Please note the returned function is not an actual state object and wouldn't pass any `instanceof` checks.

```ts
function chainableEditorState(tr: Transaction, state: EditorState): EditorState {
  return {
    ...state,
    tr,
    schema: state.schema,
    plugins: state.plugins,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
    get storedMarks() {
      return tr.storedMarks;
    },
    get selection() {
      return tr.selection;
    },
    get doc() {
      return tr.doc;
    },
  };
}
```

With this method it becomes possible to make ProseMirror commands chainable.

```ts
export function convertCommand(commandFunction: ProsemirrorCommandFunction): CommandFunction {
  return ({ state, dispatch, view, tr }) => {
    return commandFunction(chainableEditorState(tr, state), dispatch, view);
  };
}
```

When the commands call `state.tr`, they will be accessing the shared transaction that is provided by **remirror**.

So converting the `deleteTable` command from `prosemirror-tables` is possible with the with the following code snippet.

```ts
import { deleteTable } from 'prosemirror-tables';

const chainableDeleteTable = convertCommand(deleteTable);
```

## Caveats

Just because a command **can** be made chainable does not mean it **should** be made chainable.

For example, `prosemirror-history` provides the `undo` and `redo` commands. While making them chainable would work in theory, in practice, what does it actually mean for `undo` to be chainable.

Are we undoing the current transaction or last action before this transaction? It's not clear what the expected behavior should be in every situation.

There are also commands like `fixTables` from `prosemirror-tables` which are also non-chainable. The command uses `state.tr` to check if any of the tables need fixing. If they do, it dispatches them, if they don't it doesn't. Unfortunately this breaks the `isEnabled` command checks which rely on the `Transaction` not being updated unless a dispatch is provided.

As a result remirror also supports declaring commands as non-chainable.

```ts
function nonChainable(commandFunction: CommandFunction): NonChainableCommandFunction {
  return ({ state, dispatch, tr, view }) => {
    if (dispatch !== undefined || dispatch !== view?.dispatch) {
      throw new Error('Trying to call this command in a non chainable way is not supported.');
    }

    return commandFunction({ state, dispatch, tr, view });
  };
}
```

However, for the vast majority of instances chainable commands are a joy to use.

You can try them out for yourself in by installing `remirror` and following the [getting started guide](https://remirror.io/docs/guide/create-editor).

[^1]: Behind the scenes `state.tr` is a getter property which returns a `new Transaction()` every time it is accessed.
