---
slug: chainable-commands
title: Chainable commands
hide_title: true
author: Ifiok Jr.
author_title: Remirror Maintainer
author_url: https://github.com/ifiokjr
author_image_url: https://avatars1.githubusercontent.com/u/1160934?v=4
tags: [remirror, prosemirror, chaining, commands, state]
---

# Chainable commands

One of the key goals for `remirror@1.0.0` was to make consuming commands easier. Chainable commands was identified as one way in which this could be achieved.

```ts
commands.insertText('Hello').capitalize({ from: 1, to: 6 }).toggleBold().removeVowels().run();
```

Elegant as it may seem, implementing this posed some challenges.

## Challenges

By default Prosemirror commands have this signature.

```ts
type ProsemirrorCommandFunction = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView,
) => boolean;
```

Each command receives a state and creates a new transaction by calling `state.tr` [^1]. When the dispatch method is provided the command applies that transaction to the view by calling `dispatch(tr)`. A command function should returns `true` when successful and `false` when no update is possible.

The transaction is responsible for updating the state and applying the updates. While the `EditorState` is immutable in ProseMirror, the `Transaction` is a mutable object with methods that mutate the internal state. When these methods are called, different steps are applied and stored in an array which can be inspected via `tr.steps`. When the transaction is dispatched, ProseMirror reads the steps and other updated properties to create a new immutable `EditorState`.

Examples of transaction methods include `tr.insertText`, `tr.scrollIntoView` and `tr.removeMark` and this is how updates are managed within every ProseMirror editor.

Since each command creates it's own `Transaction` instance when accessing `state.tr` updates must happen one at a time in separate synchronous steps. This poses a challenge. Without a shared transaction it's not possible to chain the commands since many things can interfere with the update process.

## Configuring `remirror` for chainable commands

The first step was to pass in a **shared** transaction to every internal `remirror` command.

Since the command functions already receive _three_ positional arguments adding a _fourth_ for the shared `tr` would have bloated the function. To make the function easier to consume, all the arguments have been squashed into one parameter, giving the remirror command function the following type signature.

```ts
interface CommandFunctionParameter {
  tr: Transaction;
  state: EditorState;
  dispatch?: (tr: Transaction) => void;
  view?: EditorView;
}

type CommandFunction = (parameter: CommandFunctionParameter) => boolean;
```

So now all commands use a shared transaction. However, they each still call the dispatch function. By default when the `dispatch` function is defined it uses `view.dispatch`. This triggers the update. If this were to happen in the middle of a command chain the transaction being shared would become out of date, leading to multiple `ProseMirror` errors. The simplest way to fix this is to provide a new dispatch function that doesn't actually dispatch the transaction or update the editor.

As a bonus a check is made to ensure that the provided transaction **is** the `shared` transaction. If not, it throws an error.

To implement the actual chainability the implementation looks something like this.

```ts
class CommandsExtension extends PlainExtension {
  // The shared transaction automatically updated and manage. But that's beyond
  // the scope of this blog post.
  tr: Transaction;
  view: EditorView;
  state: EditorState;

  getChainedObject(chainableCommands: Record<string, (...args: any[]) => CommandFunction>) {
    const chained = {};

    // The dispatch function.
    const dispatch = (tr: Transaction) => {
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

With all this in place `remirror` now can make any internal command chainable.

The following example is how commands created in remirror are automatically chainable. It uses the shared `tr` property rather than creating it's own via `state.tr`.

```ts
import { CommandFunction, PlainExtension } from 'remirror/core';

class CustomExtension extends PlainExtension {
  get name() {
    return 'custom' as const;
  }

  createCommands() {
    return {
      insertAmazingWord: (word: string): CommandFunction => ({ tr, dispatch }) => {
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

While this solves the chainable problem for internally created commands, it doesn't do much for external command functions defined in `prosemirror-commands`, `prosemirror-tables`, `prosemirror-schema-list` and similar libraries which all define the commands by creating a new transaction each time.

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
      return state.storedMarks;
    },
    get selection() {
      return state.selection;
    },
    get doc() {
      return state.doc;
    },
  };
}
```

With this method now in place it's fairly trivial to convert any ProseMirror command into a chainable function.

```ts
export function convertCommand(commandFunction: ProsemirrorCommandFunction): CommandFunction {
  return ({ state, dispatch, view, tr }) => {
    return commandFunction(chainableEditorState(tr, state), dispatch, view);
  };
}
```

When the commands call `state.tr` now, they will be accessing the shared transaction that is provided by remirror.

So converting the `deleteTable` command from `prosemirror-tables` can be with the following implementation.

```ts
import { deleteTable } from 'prosemirror-tables';

const chainableDeleteTable = convertCommand(deleteTable);
```

## Caveats

Just because a command **can** be made chainable does not mean it **should** be made chainable.

For example the `prosemirror-history` plugin provides `undo` and `redo` commands. While making them chainable would work in theory, in practice, what does it actually mean to make `undo` chainable. Are you undoing the current transaction, or undoing th last action before this transaction. It's not clear what the expected behavior should be. When an API causes that kind of ambiguity it tends to be a sign that it should not be used in that situation.

There are also commands like `fixTables` from `prosemirror-tables` which I found quite difficult to make chainable. The command uses the `state.tr` to check if any of the tables need fixing. If they do, it dispatches them, if they don't it doesn't. Unfortunately this would break `isEnabled` command checks which rely on the `transaction` not being updated unless dispatch is provided. There are ways around this but they seemed overkill.

As a result remirror also supports declaring commands as non-chainable for reasons of design, feasibility or performance.

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

You can try them out for yourself in by installing `remirror@next` for yourself and giving it a go.

[^1]: Behind the scenes `state.tr` is a getter property which returns a `new Transaction()` every time it is accessed.
