---
'multishift': patch
'@remirror/core-utils': patch
---

Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
