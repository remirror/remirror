---
'remirror': patch
---

## 💥 BREAKING CHANGES! 💥

### CodemirrorExtension is no longer bundled with `remirror`

In an effort to slim down the number of dependencies required when installing Remirror, the `CodemirrorExtension` (version 5) has been removed, from the main entry point `remirror`.

If you still need the functionality provided by this extension, simply add `@remirror/extension-codemirror5` as a direct dependency to your application.

#### Before: Remirror v2 example

```tsx
import { CodemirrorExtension } from 'remirror/extensions';
```

#### After: Remirror v3 example

```tsx
import { CodemirrorExtension } from '@remirror/extension-codemirror5';
```
