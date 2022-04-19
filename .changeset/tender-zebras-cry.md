---
'@remirror/extension-events': minor
---

Create a "stepping stone" for future standardisation of useEvent types

Add a second parameter to handlers for `hover` and `contextmenu` types, so we can eventually standarise the hook to pass event as the first argument.

```tsx
const handleHover = useCallback(({ event: MouseEvent }, props: HoverEventHandlerState) => {
  const { getNode, hovering, ...rest } = props;
  console.log('node', getNode(), 'is hovering', hovering, 'rest', rest);

  return false;
}, []);

useEvent('hover', handleHover);
```
