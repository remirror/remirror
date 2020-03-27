`@remirror/core-constants`

- Add error constants
- Rename `Tags` to `Tag`.

`@remirror/core`

- Remove `helpers` from extension
- Change extension to be a real class.
- Change styles to wrapper components
- All constructors are now private - create instance with the `.of` static helper.
- Extension no longer exposes multiple methods. Just the important lifecyle methods.
- Removed the number of exports
- Rely on `export type` syntax to support babel transpilation

- Rename `ObjectNode` to `RemirrorJSON` and `ObjectDocNode` to `RemirrorJSONDoc` or something along
  those lines
