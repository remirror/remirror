---
'@remirror/core': minor
'@remirror/core-utils': minor
---

Enable disabling input rules with a `shouldSkip` method. This is now available as a handler for the `InputRulesExtension` via `shouldSkipInputRule`.

Consuming this API looks something like this.

```ts
import { Dispose, PlainExtension } from 'remirror/core';

class CoolExtension extends PlainExtension {
  get name() {
    return 'cool';
  }

  onCreate(): Dispose {
    // Add the `shouldSkip` predicate check to this extension.
    return this.store.getExtension(InputRulesExtension).addHandler('shouldSkipInputRule', () => {
      if (something) {
        return true;
      }

      return false;
    });
  }
}
```
