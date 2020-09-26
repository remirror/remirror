---
'@remirror/core': minor
'@remirror/core-types': patch
---

Add new `extensionDecorator` function which augments the static properties of an `Extension` constructor when used as a decorator.

The following code will add a decorator to the extension.

```ts
import { extensionDecorator, ExtensionPriority, PlainExtension } from 'remirror/core';

interface ExampleOptions {
  color?: string;

  /**
   * This option is annotated as a handler and needs a static property.
   **/
  onChange?: Handler<() => void>;
}

@extensionDecorator<ExampleOptions>({
  defaultOptions: { color: 'red' },
  defaultPriority: ExtensionPriority.Lowest,
  handlerKeys: ['onChange'],
})
class ExampleExtension extends PlainExtension<ExampleOptions> {
  get name() {
    return 'example' as const;
  }
}
```

The extension decorator updates the static properties of the extension. If you prefer not to use decorators it can also be called as a function. The `Extension` constructor is mutated by the function call and does not need to be returned.

```ts
extensionDecorator({ defaultSettings: { color: 'red' } })(ExampleExtension);
```
