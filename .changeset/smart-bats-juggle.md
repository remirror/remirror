---
'@remirror/core': patch
'@remirror/core-utils': patch
'@remirror/react': patch
---

Add support for attribute filtering for `useActive` and `useAttrs` hooks when used with marks.

This provides consistent behaviour for the hook, aligning with functionality provided for node types.

```tsx
const active = useActive();

// Previously this ignored passed attributes and only checked the mark's type
//
// Now this will only return true if mark type is active AND its color attribute is red
const isActive = active.textColor({ color: 'red' });
```
