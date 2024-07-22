---
'@remirror/react': patch
---

## 💥 BREAKING CHANGES! 💥

### (React) Table Extension is no longer bundled with `@remirror/react`

The `TableExtension` also known as ReactTableExtension exposed via `@remirror/react` (_not_ `remirror`) adds significant bloat to the core package.

Furthermore, since the addition of Table positioners [added in Remirror 2.0.12](https://github.com/remirror/remirror/pull/1915) this function has become largely redundant.

If you still need the functionality provided by this extension, simply add `@remirror/extension-react-tables` as a direct dependency to your application.

#### Before: Remirror v2 example

```tsx
import { TableComponents, tableControllerPluginKey, TableExtension } from '@remirror/react';
```

#### After: Remirror v3 example

```tsx
import {
  TableComponents,
  tableControllerPluginKey,
  TableExtension,
} from '@remirror/extension-react-tables';
```
