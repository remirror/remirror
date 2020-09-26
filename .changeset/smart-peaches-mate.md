---
'@remirror/core': minor
---

Add new `presetDecorator` function which augments the static properties of an `Preset` constructor when used as a decorator.

The following code will add a decorator to the preset.

```ts
import { Preset, presetDecorator } from 'remirror/core';

interface ExampleOptions {
  color?: string;

  /**
   * This option is annotated as a handler and needs a static property.
   **/
  onChange?: Handler<() => void>;
}

@presetDecorator<ExampleOptions>({
  defaultOptions: { color: 'red' },
  handlerKeys: ['onChange'],
})
class ExamplePreset extends Preset<ExampleOptions> {
  get name() {
    return 'example' as const;
  }
}
```

The preset decorator updates the static properties of the preset. If you prefer not to use decorators it can also be called as a function. The `Preset` constructor is mutated by the function call and does not need to be returned.

```ts
presetDecorator({ defaultSettings: { color: 'red' }, handlerKeys: ['onChange'] })(ExamplePreset);
```
