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

Quick thoughts

New extension api for adding behaviour to the editor.

- Can update the extension manager data
- Can add new methods and options to the extensions creator params via global types
- Can easily update an extension (using the extension constructor) - updateOptions (settings)
- Event methods for tapping into the extension manager lifecycle.

Helpers API should be added back, but this time each node and mark automatically has an `isActive`
helper.

Commands are chainable when called with the `.chain` helper.
