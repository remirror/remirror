---
'remirror': patch
---

## 💥 BREAKING CHANGES! 💥

### YjsExtension is no longer bundled with `remirror`

In an effort to slim down the number of dependencies required when installing Remirror, the `YjsExtension` has been removed, from the main entry point `remirror`.

If you still need the functionality provided by this extension, simply add `@remirror/extension-yjs` as a direct dependency to your application.

#### Before: Remirror v2 example

```tsx
import { YjsExtension } from 'remirror/extensions';
```

#### After: Remirror v3 example

```tsx
import { YjsExtension } from '@remirror/extension-yjs';
```
