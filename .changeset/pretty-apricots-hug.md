---
'@remirror/core': minor
---

Improve the way `ExtensionManager` calls `Extension.keys` methods. Keys now use the new api for
CommandFunctions which provides a `next` method. This method allows for better control when deciding whether
or not to defer to the next keybinding in the chain.

To override, create a new keybinding with another extension. Make sure the extension is created with a higher
priority. The keybinding you create can either return true or false. By default if it returns true, no other
keybindings will run. However if it returns `false` all other keybindings will be run until one returns `true`

`next` basically calls the every lower priority keybinding in the extensions list. It gives you full control
of how the bindings are called.
