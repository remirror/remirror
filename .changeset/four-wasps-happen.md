---
'@remirror/react': patch
---

Fix bad `setState()` warning when rendering a controlled `RemirrorProvider` with child component. By wrapping the controlled state update within `useLayoutEffect` hook,updates now synchronously happen during the commit phase. `useEffect` caused errors in ProseMirror due to the asynchronous update.
