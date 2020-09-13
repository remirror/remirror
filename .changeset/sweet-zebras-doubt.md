---
'@remirror/extension-link': minor
'@remirror/extension-auto-link': patch
---

Add support for `autoLink` in `LinkExtension`. The option defaults to false and must be turned on. This is intended to replace the `AutoLinkExtension`.

```ts
import { LinkExtension } from 'remirror/extension-link';

const link = new LinkExtension({ autoLink: true });

// Or you can turn it on and off during run time.
link.setOptions({ autoLink: true });
```
