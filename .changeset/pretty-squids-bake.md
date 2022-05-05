---
'@remirror/extension-link': minor
---

Add support for `autoLinkAllowedTLDs` which enables the restriction of auto links to a set of Top Level Domains (TLDs). Defaults to the top 50 TLDs (as of May 2022).

For a more complete list, you could replace this with the `tlds` or `global-list-tlds` packages.

Or to extend the default list you could

```ts
import { LinkExtension, TOP_50_TLDS } from 'remirror/extensions';
const extensions = () => [
  new LinkExtension({ autoLinkAllowedTLDs: [...TOP_50_TLDS, 'london', 'tech'] }),
];
```

Tweak auto link regex to prevent match of single digit domains (i.e. 1.com) and remove support for hostnames ending with "." i.e. "remirror.io."
