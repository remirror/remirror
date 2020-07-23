---
'@remirror/react': minor
'remirror': patch
'@remirror/core': major
'@remirror/dom': patch
---

- Rename `change` event to `updated`. `updated` is called with the `EventListenerParameter`.
- Add new manager `stateUpdate` to the `editorWrapper`
- Add `autoUpdate` option to `useRemirror` hook from `@remirror/react` which means that the context object returned by the hook is always up to date with the latest editor state. It will also cause the component to rerender so be careful to only use it when necessary.

```tsx
const { active, commands } = useRemirror({ autoUpdate: true });

return (
  <button
    onClick={() => commands.toggleBold}
    style={{ fontWeight: active.bold() ? 'bold' : undefined }}
  >
    B
  </button>
);
```

- Fix broken `onChangeHandler` parameter for the use `useRemirror` hook.
