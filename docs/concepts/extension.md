---
hide_title: true
title: Extension
---

# Extension

Extensions manage similar concerns. It allows for grouping items that affect:

- How the editor displays certain content, i.e. **bold**, _italic_, <u>underline</u>.
- Makes certain commands available e.g. `commands.toggleBold()` to toggle the bold formatting of the currently selected text.
- Check if a command can be run for the current selection `commands.undo.isEnabled()`.
- Check if a mark is active at the current selection, `active.italic()`.
- Register ProseMirror plugins, keymaps, input rules, paste rules, and custom nodeViews, which affect the behaviour of the editor.

There are three types of `Extension`.

- `NodeExtension` - For creating [ProseMirror nodes](https://prosemirror.net/docs/ref/#model.Node) in the editor.
- `MarkExtension` - For creating [ProseMirror marks](https://prosemirror.net/docs/ref/#model.Mark) in the editor.
- `PlainExtension` - For behaviour which doesn't need to be displayed in the DOM.

## Lifecycle Methods

Extensions are able to completely customise the behaviour of the editor via these lifecycle methods. Even core functionality like the creation of `Schema` is built via `Extension`s. This section outlines what you're working with in extensions.

### `onCreate`

```ts
function onCreate(): void;
```

This handler is called when the `RemirrorManager` is first created. Since it is called as soon as the manager is created some methods may not be available in the extension store. When accessing methods on `this.store` be sure to check their documentation for when they become available. It is recommended that you don't use this method unless absolutely required.

### `onView`

```ts
function onView(view: EditorView<EditorSchema>): void;
```

This lifecycle method is called when the `EditorView` is first added by the UI layer. This is the lifecycle method where commands and editor helpers are added.

### `onStateUpdate`

```ts
function onStateUpdate(parameter: import('remirror').StateUpdateLifecycleParameter): void;
```

This is called whenever a transaction successfully updates the `EditorState`. For controlled component this is called whenever the state value is updated.

### `onDestroy`

```ts
function onDestroy(): void;
```

This is called when the `RemirrorManager` is being destroyed. You can use this method if you need to clean up any externally created handlers in order to prevent memory leaks.

## Options

Options are used to configure the extension at runtime. They come in four different flavours via the option annotations.

```ts
import {
  CustomHandler,
  Dynamic,
  extensionDecoration,
  ExtensionPriority,
  Handler,
  PlainExtension,
  Static,
} from 'remirror';

interface ExampleOptions {
  // `Static` types can only be provided at instantiation.
  type: Static<'awesome' | 'not-awesome'>;

  // Options are `Dynamic` by default.
  color?: string;

  // `Dynamic` properties can also be set with the annotation, although it's unnecessary.
  backgroundColor?: Dynamic<string>;

  // `Handlers` are used to represent event handlers.
  onChange?: Handler<() => void>;

  // `CustomHandler` options are for customised handlers and it's completely up
  // to you to integrate them properly.
  keyBindings: CustomHandler<Record<string, () => boolean>>;
}

@extensionDecorator<ExampleOptions>({
  defaultOptions: { color: 'red', backgroundColor: 'green' },
  defaultPriority: ExtensionPriority.High,

  // Let's the extension know that these are the static keys
  staticKeys: ['type'],

  // Provides the keys which should be converted into handlers.
  handlerKeys: ['onChange'],

  // Provides the keys which should be created treated as custom handlers.
  customHandlerKeys: ['keyBindings'],
})
class ExampleExtension extends PlainExtension<ExampleOptions> {
  get name() {
    return 'example' as const;
  }
}
```

These annotations can be used to provide better intellisense support for the end user.

### `extensionDecorator`

The extension decorator updates the static properties of the extension. If you prefer not to use decorators it can also be called as a function. The `Extension` constructor is mutated by the function call.

```ts
extensionDecorator({ defaultSettings: { color: 'red' } })(ExampleExtension);
```

If you really don't like this pattern then you can also set the same options as static properties.

### `Dynamic` options

`Dynamic` options can be passed in at instantiation and also during runtime. When no annotation exists the option is assumed to be dynamic.

```ts
const exampleExtension = new ExampleExtension({
  type: 'awesome',
  color: 'blue',
  backgroundColor: 'yellow',
});

// Runtime update
exampleExtension.setOptions({ color: 'pink', backgroundColor: 'purple' });
```

Please note that as mentioned in this issue [#624](https://github.com/remirror/remirror/issues/624), partial options can cause trouble when setting a default.

If you need to accept `undefined`as an acceptable default option there are two possible ways to resolve this.

#### Use `AcceptUndefined`

This is the preferred solution and should be used instead of the following `null` union.

```ts
import { AcceptUndefined } from 'remirror';

interface Options {
  optional?: AcceptUndefined<string>;
}
```

Now when the options are consumed by this decorator there should be no errors when setting the value to `undefined`.

#### `null` union

If you don't mind using nulls in your code then this might appeal to you.

```ts
interface Options {
  optional?: string | null;
}
```

### `Static` options

`Static` options should be used when it is not possible to update an option during runtime. Typically this is reserved for options that affect the schema, since the schema is created at initialization. They will throw an error if an error if updated during runtime.

```ts
const exampleExtension = new ExampleExtension({
  type: 'awesome',
});

// Will throw an error.
exampleExtension.setOptions({ type: 'not-awesome' });
```

### `Handler` options

`Handler` options are a pseudo option in that they are completely handled by the underlying remirror extension.

To get them to work we would change the above example extension implentation to look like the following.

```ts
import { hasTransactionChanged, StateUpdateLifecycleParameter } from 'remirror';
import { hasStateChanged } from 'remirror/extension-positioner';

@extensionDecorator<ExampleOptions>({
  defaultOptions: { color: 'red', backgroundColor: 'green' },
  defaultPriority: ExtensionPriority.High,
  staticKeys: ['type'],
  handlerKeys: ['onChange'],
  customHandlerKeys: ['keyBindings'],
})
class ExampleExtension extends PlainExtension<ExampleOptions> {
  get name() {
    return 'example' as const;
  }

  onTransaction(parameter: StateUpdateLifecycleParameter) {
    const { state } = parameter;
    const { tr, state, previousState } = parameter;

    const hasChanged = tr
      ? hasTransactionChanged(tr)
      : !state.doc.eq(previousState.doc) || !state.selection.eq(previousState.selection);

    if (!hasChanged) {
      return;
    }

    if (state.doc.textContent.includes('example')) {
      // Call the handler when certain text is matched
      this.options.onChange();
    }
  }
}
```

Now that the extension is wired to respond to `onChange` handlers we can add a new handler.

```ts
const exampleExtension = new ExampleExtension({
  type: 'awesome',
});

const disposeChangeHandler = exampleExtension.addHandler('onChange', () => {
  console.log('example was found');
});

// Later
disposeChangeHandler();
```

The `onChange` handler is automatically managed for you.

### `CustomHandler` options

`CustomHandler` options are like `Handler` options except it's up to the extension creator to manage how they are handled. They are useful for situations when you want the extension to allow composition of events but it doesn't quite fit into the neat `EventHandler` scenario.

The KeymapExtension in `@remirror/core` is a good example of this.
