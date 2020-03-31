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

Advice when creating extensions

Keep them light and simple especially when public. Extensions can do many things but it's better to
have many extensions that to do one thing. The functionality can later be combined in a preset.

### Presets

Presets are a new way of managing functionality in the editor. Combine extensions together with a
new config api.

`@remirror/react`

Creates and extension which modifies the manager and adds an initialization parameter that allows
for the portal container to be passed through.

The flow is like

- Factories (Factorys) -> Constructor -> Instance
- Factories create Constructors which make Instances.

Rules of extensions

Each extension can only be used once for the editor. This means that for a list of extension and
presets the extension manager will go through the extensions and make sure the highest priority
duplicates are the only ones that are left. It will then call all presets to their extension
instances to this new extension.

- [ ] Still to do: define `reactNodeViews` option in the `react` code-base and test nodeViews in a
      non trivial example `footnotes`. Built in react extension which adds a new parameter to the
      extensionManager init params `portalContainer` which is then used in `reactNodeViews`.
